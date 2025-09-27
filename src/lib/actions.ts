'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { suggestSalesPostingRules, type SuggestSalesPostingRulesInput, type SuggestSalesPostingRulesOutput } from '@/ai/flows/suggest-sales-posting-rules';

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
