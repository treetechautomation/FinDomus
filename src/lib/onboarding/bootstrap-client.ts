import { User } from 'firebase/auth';

export async function bootstrapCurrentUser(user: User | null): Promise<any> {
  if (!user) return null;

  try {
    const idToken = await user.getIdToken();
    const response = await fetch('/api/onboarding/bootstrap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in bootstrapCurrentUser:', error);
    throw error;
  }
}
