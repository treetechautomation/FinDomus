import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateImportHash } from '@/services/firestore/transactions';
import { parseNubankInvoicePDF } from '@/core/imports/nubank-invoice-pdf-parser';
import { SANITIZED_NUBANK_INVOICE_TEXT } from '@/core/imports/__fixtures__/nubank-sanitized-fixture';

describe('FINDOMUS - P30A STABLE TRANSACTION IDENTITY & INTRA-BATCH DEDUPE TEST SUITE', () => {

  const baseTx = {
    date: '2026-08-15',
    amount: 150.00,
    description: 'Posto Shell Graal',
    merchant: 'Posto Shell Graal',
    owner: 'PF' as const,
  };

  // A. Two identical legitimate transactions -> 2 distinct import hashes
  it('A: Two identical legitimate transactions produce 2 distinct import hashes', () => {
    const hash0 = generateImportHash({ ...baseTx, sourceOccurrenceIndex: 0 });
    const hash1 = generateImportHash({ ...baseTx, sourceOccurrenceIndex: 1 });

    assert.notStrictEqual(hash0, hash1);
    assert.strictEqual(typeof hash0, 'string');
    assert.strictEqual(typeof hash1, 'string');
    assert.ok(hash0.length > 0);
    assert.ok(hash1.length > 0);
  });

  // B. Three identical legitimate transactions -> 3 distinct import hashes
  it('B: Three identical legitimate transactions produce 3 distinct import hashes', () => {
    const hash0 = generateImportHash({ ...baseTx, sourceOccurrenceIndex: 0 });
    const hash1 = generateImportHash({ ...baseTx, sourceOccurrenceIndex: 1 });
    const hash2 = generateImportHash({ ...baseTx, sourceOccurrenceIndex: 2 });

    const hashSet = new Set([hash0, hash1, hash2]);
    assert.strictEqual(hashSet.size, 3);
  });

  // C. Exact reimport -> same three hashes
  it('C: Exact reimport produces the identical set of three hashes', () => {
    const run1 = [
      generateImportHash({ ...baseTx, sourceOccurrenceIndex: 0 }),
      generateImportHash({ ...baseTx, sourceOccurrenceIndex: 1 }),
      generateImportHash({ ...baseTx, sourceOccurrenceIndex: 2 }),
    ];

    const run2 = [
      generateImportHash({ ...baseTx, sourceOccurrenceIndex: 0 }),
      generateImportHash({ ...baseTx, sourceOccurrenceIndex: 1 }),
      generateImportHash({ ...baseTx, sourceOccurrenceIndex: 2 }),
    ];

    assert.deepStrictEqual(run1, run2);
  });

  // D. Ignore first occurrence after parse -> second occurrence hash unchanged
  it('D: Ignoring the first occurrence does not change the second occurrence hash (review stability)', () => {
    const parsedItems = [
      { ...baseTx, sourceOccurrenceIndex: 0, ignored: false },
      { ...baseTx, sourceOccurrenceIndex: 1, ignored: false },
    ];

    const initialHash0 = generateImportHash(parsedItems[0]);
    const initialHash1 = generateImportHash(parsedItems[1]);

    // User ignores first occurrence
    parsedItems[0].ignored = true;

    // Remaining participating item is parsedItems[1]
    const filteredParticipating = parsedItems.filter(item => !item.ignored);
    assert.strictEqual(filteredParticipating.length, 1);
    assert.strictEqual(filteredParticipating[0].sourceOccurrenceIndex, 1);

    const postFilterHash1 = generateImportHash(filteredParticipating[0]);
    assert.strictEqual(postFilterHash1, initialHash1);
    assert.notStrictEqual(postFilterHash1, initialHash0);
  });

  // E. Refund vs expense -> different hashes
  it('E: Refund and expense with otherwise identical tuple do not collide', () => {
    const expenseHash = generateImportHash({ ...baseTx, isRefund: false, sourceOccurrenceIndex: 0 });
    const refundHash = generateImportHash({ ...baseTx, isRefund: true, sourceOccurrenceIndex: 0 });

    assert.notStrictEqual(expenseHash, refundHash);

    // Also with occurrence > 0
    const expenseHash1 = generateImportHash({ ...baseTx, isRefund: false, sourceOccurrenceIndex: 1 });
    const refundHash1 = generateImportHash({ ...baseTx, isRefund: true, sourceOccurrenceIndex: 1 });
    assert.notStrictEqual(expenseHash1, refundHash1);
    assert.notStrictEqual(expenseHash1, expenseHash);
    assert.notStrictEqual(refundHash1, refundHash);
  });

  // F. PF vs PJ -> different hashes
  it('F: PF and PJ with identical transaction details produce different hashes', () => {
    const pfHash = generateImportHash({ ...baseTx, owner: 'PF', sourceOccurrenceIndex: 0 });
    const pjHash = generateImportHash({ ...baseTx, owner: 'PJ', sourceOccurrenceIndex: 0 });

    assert.notStrictEqual(pfHash, pjHash);
  });

  // G. OFX externalId hash unchanged (ignores sourceOccurrenceIndex)
  it('G: OFX with externalId produces identical hash regardless of sourceOccurrenceIndex', () => {
    const ofxBase = {
      ...baseTx,
      externalId: 'FITID-20260815-998811',
    };

    const hashWithoutOcc = generateImportHash(ofxBase);
    const hashWithOcc0 = generateImportHash({ ...ofxBase, sourceOccurrenceIndex: 0 });
    const hashWithOcc1 = generateImportHash({ ...ofxBase, sourceOccurrenceIndex: 1 });

    assert.strictEqual(hashWithoutOcc, hashWithOcc0);
    assert.strictEqual(hashWithoutOcc, hashWithOcc1);
  });

  // H. Legacy single PDF transaction hash unchanged
  it('H: Single transaction without sourceOccurrenceIndex matches legacy hash formula', () => {
    const legacyHash = generateImportHash({
      date: '2026-08-15',
      amount: 150.00,
      description: 'Posto Shell Graal',
      merchant: 'Posto Shell Graal',
      owner: 'PF',
    });

    const newHashOcc0 = generateImportHash({
      date: '2026-08-15',
      amount: 150.00,
      description: 'Posto Shell Graal',
      merchant: 'Posto Shell Graal',
      owner: 'PF',
      sourceOccurrenceIndex: 0,
    });

    assert.strictEqual(legacyHash, newHashOcc0);
  });

  // I. CSV transaction without occurrence field unchanged
  it('I: CSV transaction without sourceOccurrenceIndex generates legacy hash', () => {
    const csvTx = {
      date: '2026-08-10',
      amount: 42.50,
      description: 'Padaria Estrela',
      merchant: 'Padaria Estrela',
    };

    const hash1 = generateImportHash(csvTx);
    const hash2 = generateImportHash({ ...csvTx, sourceOccurrenceIndex: undefined });

    assert.strictEqual(hash1, hash2);
  });

  // J. Occurrence 0 exact legacy compatibility
  it('J: Occurrence 0 is exactly identical to legacy hash without discriminator', () => {
    const tx = {
      date: '2026-07-22',
      amount: 99.90,
      description: 'Uber *Trip',
      merchant: 'Uber',
      owner: 'PJ' as const,
      isRefund: false,
    };

    const legacy = generateImportHash(tx);
    const withZero = generateImportHash({ ...tx, sourceOccurrenceIndex: 0 });

    assert.strictEqual(legacy, withZero);
  });

  // K. Parser assigns stable sourceOccurrenceIndex sequentially during raw parse
  it('K: Nubank invoice parser assigns sequential sourceOccurrenceIndex for identical lines', async () => {
    const result = await parseNubankInvoicePDF(SANITIZED_NUBANK_INVOICE_TEXT);
    assert.strictEqual(result.success, true);
    if (!result.success) return;

    const dl99 = result.transactions.filter(t => t.description.includes('Dl*99 Ride') && t.amount === 8.80);
    assert.strictEqual(dl99.length, 2);
    assert.strictEqual(dl99[0].sourceOccurrenceIndex, 0);
    assert.strictEqual(dl99[1].sourceOccurrenceIndex, 1);

    const h0 = generateImportHash({
      date: dl99[0].date,
      amount: dl99[0].amount,
      description: dl99[0].description,
      merchant: dl99[0].merchant,
      isRefund: dl99[0].isRefund,
      sourceOccurrenceIndex: dl99[0].sourceOccurrenceIndex,
    });
    const h1 = generateImportHash({
      date: dl99[1].date,
      amount: dl99[1].amount,
      description: dl99[1].description,
      merchant: dl99[1].merchant,
      isRefund: dl99[1].isRefund,
      sourceOccurrenceIndex: dl99[1].sourceOccurrenceIndex,
    });

    assert.notStrictEqual(h0, h1);
  });

});
