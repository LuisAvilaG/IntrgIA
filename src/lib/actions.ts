'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { suggestSalesPostingRules, type SuggestSalesPostingRulesInput, type SuggestSalesPostingRulesOutput } from '@/ai/flows/suggest-sales-posting-rules';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
  // In a real app, you'd validate credentials against a database
  const email = formData.get('email');
  if (email) {
    cookies().set('auth_token', 'mock_user_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    redirect('/');
  }
}

export async function logout() {
  cookies().delete('auth_token');
  redirect('/login');
}

export async function getAiSuggestions(input: SuggestSalesPostingRulesInput): Promise<SuggestSalesPostingRulesOutput> {
    try {
        const suggestions = await suggestSalesPostingRules(input);
        return suggestions;
    } catch (error) {
        console.error("AI suggestion error:", error);
        throw new Error("Failed to get AI suggestions.");
    }
}

export async function saveErpCredentials(formData: FormData) {
  const n8nUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
  const endpoint = `${n8nUrl}/credentials/erp`;

  const data = {
    integrationid: formData.get('integrationid'),
    accountId: formData.get('account-id'),
    consumerKey: formData.get('consumer-key'),
    consumerSecret: formData.get('consumer-secret'),
    tokenId: formData.get('token-id'),
    tokenSecret: formData.get('token-secret'),
    connectionType: 'netsuite_tba', // Campo añadido como solicitado
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to save ERP credentials:', errorData);
      return { success: false, message: errorData.message || 'An unknown error occurred.' };
    }

    const result = await response.json();
    
    // Assuming a successful request means we can proceed, revalidate if needed
    // revalidatePath('/path-to-revalidate');

    return { success: true, data: result };
  } catch (error) {
    console.error('Error saving ERP credentials:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, message };
  }
}
