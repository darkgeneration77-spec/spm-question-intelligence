'use server';

import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

export async function login(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/workspace');

  if (!email || !password) redirect('/login?error=missing');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect('/login?error=invalid');
  redirect(next.startsWith('/') ? next : '/workspace');
}

export async function signUp(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || password.length < 8) redirect('/login?error=signup');

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) redirect('/login?error=signup');
  redirect('/login?message=check-email');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
