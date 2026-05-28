import { adminAuth } from '../../src/lib/firebase-admin';

async function listUsers() {
  console.log('--- Listando usuários do Firebase Auth --- \n');
  
  try {
    const listUsersResult = await adminAuth.listUsers();
    
    if (listUsersResult.users.length === 0) {
      console.log('Nenhum usuário encontrado no Firebase Auth.');
      return;
    }

    const users = listUsersResult.users.map(userRecord => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || 'Sem nome'
    }));

    console.table(users);
  } catch (error: any) {
    console.error('Erro ao listar usuários:', error.message);
  }
}

listUsers().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
