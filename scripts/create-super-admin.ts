import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId:
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function main() {
  const email = 'prakaji69@gmail.com';
  const password = 'PR@020300jr';
  const displayName = 'Super Admin';

  console.log(`Checking if user ${email} already exists in Firebase Auth...`);
  let uid = '';
  try {
    const userRecord = await auth.getUserByEmail(email);
    uid = userRecord.uid;
    console.log(`User already exists with UID: ${uid}`);
    
    // Update password and displayName
    await auth.updateUser(uid, {
      password: password,
      displayName: displayName
    });
    console.log(`Password and display name updated for user.`);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log(`User not found, creating new account...`);
      const userRecord = await auth.createUser({
        email,
        password,
        displayName,
      });
      uid = userRecord.uid;
      console.log(`User created successfully with UID: ${uid}`);
    } else {
      throw error;
    }
  }

  console.log(`Updating user document in Firestore users/${uid}...`);
  await db.collection('users').doc(uid).set({
    displayName,
    email,
    role: 'SUPER_ADMIN',
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }, { merge: true });

  console.log(`✅ Super Admin created/updated successfully!`);
}

main().catch((err) => {
  console.error(`❌ Error creating super admin:`, err);
  process.exit(1);
});
