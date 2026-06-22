import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Plan {
  id: string;
  name: string;
  price: number;
  maxMembers: number;
  features: string[];
}

export const PLANS: Record<string, Plan> = {
  individual: {
    id: 'individual',
    name: 'Individual',
    price: 0,
    maxMembers: 1,
    features: ['1 membro', 'Controle financeiro PF/PJ', 'Relatórios básicos'],
  },
  family: {
    id: 'family',
    name: 'Família',
    price: 29.90,
    maxMembers: 3,
    features: ['Até 3 membros compartilhados', 'Controle de contas e cartões unificados', 'Relatórios avançados'],
  },
  family_premium: {
    id: 'family_premium',
    name: 'Família Premium',
    price: 59.90,
    maxMembers: 10,
    features: ['Até 10 membros compartilhados', 'Multitenancy PF/PJ completo', 'IA Financeira avançada', 'Suporte prioritário'],
  },
};

export async function getPlanById(planId: string): Promise<Plan | null> {
  try {
    const docRef = doc(db, 'plans', planId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Plan;
    }
  } catch (error) {
    console.error('Error fetching plan from firestore:', error);
  }
  return PLANS[planId] || null;
}

export async function getPlans(): Promise<Plan[]> {
  try {
    const snap = await getDocs(collection(db, 'plans'));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Plan));
    }
  } catch (error) {
    console.error('Error fetching plans from firestore:', error);
  }
  return Object.values(PLANS);
}

export async function seedPlans(): Promise<void> {
  for (const [id, plan] of Object.entries(PLANS)) {
    const docRef = doc(db, 'plans', id);
    await setDoc(docRef, plan, { merge: true });
  }
}
