const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
require("dotenv").config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function isBad(t) {
  const d = String(t.date || "");
  const y = Number(d.slice(6, 10));
  const desc = String(t.description || "").toLowerCase();

  return desc.includes("saldo do dia") || y < 2000 || d.includes("/0002");
}

(async () => {
  const snap = await getDocs(collection(db, "transactions"));
  let count = 0;

  snap.forEach((d) => {
    const data = d.data();
    if (isBad(data)) {
      console.log("REMOVER:", data.description, data.date, data.amount);
      count++;
    }
  });

  console.log("TOTAL PARA REMOVER:", count);
})();
