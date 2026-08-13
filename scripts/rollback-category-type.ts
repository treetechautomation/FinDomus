// CLASSIFIER.2B — Rollback da migração de `categoryType`.
//
// Consome EXCLUSIVAMENTE um snapshot gerado por migrate-category-type.ts
// (formato .backups/classifier.2/category-type-migration-*.json, sem o
// sufixo ".dry-run"). Não infere nada, não recalcula nada — só desfaz
// exatamente o que o snapshot registrou.
//
// Para cada entrada:
//   categoryTypeBefore === null  -> remove o campo com FieldValue.delete()
//   categoryTypeBefore !== null  -> restaura exatamente esse valor
//
// Mesmo mecanismo de proteção do script de migração: modo padrão é dry-run;
// só escreve com --apply --confirm-category-type-rollback.
//
// NÃO EXECUTADO NESTA FASE (CLASSIFIER.2B GATE 1) — projetado apenas.
//
// Execução:
//   npx tsx scripts/rollback-category-type.ts --snapshot <caminho>              (dry-run)
//   npx tsx scripts/rollback-category-type.ts --snapshot <caminho> --apply --confirm-category-type-rollback

import { readFileSync } from 'fs';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '../src/lib/firebase-admin';

function parseArgs() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const confirm = args.includes('--confirm-category-type-rollback');
  const snapshotIdx = args.indexOf('--snapshot');
  const snapshotPath = snapshotIdx !== -1 ? args[snapshotIdx + 1] : null;
  return { apply, confirm, snapshotPath };
}

async function main() {
  const { apply, confirm, snapshotPath } = parseArgs();

  if (!snapshotPath) {
    console.error('ABORTADO: informe --snapshot <caminho-do-json>.');
    process.exit(1);
  }

  if (apply && !confirm) {
    console.error('ABORTADO: --apply requer também --confirm-category-type-rollback. Nenhuma escrita foi realizada.');
    process.exit(1);
  }

  const willWrite = apply && confirm;
  console.log(willWrite ? '=== MODO: APPLY (rollback real) ===' : '=== MODO: DRY-RUN (nenhuma escrita) ===');

  const raw = JSON.parse(readFileSync(snapshotPath, 'utf-8'));
  const entries: Array<{ documentId: string; name: string; categoryTypeBefore: string | null; categoryTypeAfter: string }> = raw.entries || [];

  if (raw.mode !== 'apply') {
    console.warn('AVISO: o snapshot informado foi gerado em modo dry-run (nenhuma escrita foi de fato aplicada por ele). Rollback contra um dry-run não tem efeito real a desfazer.');
  }

  console.log(`Snapshot: ${snapshotPath}`);
  console.log(`Entradas: ${entries.length}`);

  const plan = entries.map((e) => ({
    id: e.documentId,
    name: e.name,
    action: e.categoryTypeBefore === null ? 'REMOVER campo categoryType' : `RESTAURAR categoryType = ${e.categoryTypeBefore}`,
  }));

  console.log('\nPlano de rollback (amostra até 10):');
  plan.slice(0, 10).forEach((p) => console.log(`  id=${p.id} name="${p.name}" -> ${p.action}`));

  if (!willWrite) {
    console.log(`\n=== DRY-RUN DE ROLLBACK CONCLUÍDO — ${plan.length} operações planejadas, ZERO WRITES ===`);
    return;
  }

  console.log('\n=== APLICANDO ROLLBACK ===');
  let written = 0;
  for (const e of entries) {
    const ref = adminDb.collection('categories').doc(e.documentId);
    if (e.categoryTypeBefore === null) {
      await ref.update({ categoryType: FieldValue.delete() });
    } else {
      await ref.update({ categoryType: e.categoryTypeBefore });
    }
    written++;
  }
  console.log(`Rollback concluído: ${written}/${entries.length}`);
}

main().catch((err) => {
  console.error('ERRO:', err);
  process.exit(1);
});
