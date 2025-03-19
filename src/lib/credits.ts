
import { supabase } from './supabase';

interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price: number;
}

export const creditPackages: CreditPackage[] = [
  { id: 1, name: 'Basic', credits: 5, price: 25 },
  { id: 2, name: 'Standard', credits: 15, price: 60 },
  { id: 3, name: 'Premium', credits: 50, price: 150 },
];

export const subscriptionPlans = [
  { id: 1, name: 'Monthly Basic', credits: 10, price: 39, period: 'month' },
  { id: 2, name: 'Monthly Plus', credits: 30, price: 99, period: 'month' },
];

export async function getUserCredits() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    // If no credits record found, create one
    if (error.code === 'PGRST116') {
      return await initializeUserCredits(user.id);
    }
    throw error;
  }

  return data;
}

async function initializeUserCredits(userId: string) {
  const { data, error } = await supabase
    .from('user_credits')
    .insert({
      user_id: userId,
      credits: 3, // 3 free credits
      next_reset: getNextMonthDate()
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function useCredit() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get current credits
  const { data: currentCredits, error: fetchError } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  // Check if user has credits
  if (currentCredits.credits < 1) {
    throw new Error('Not enough credits');
  }

  // Deduct one credit
  const { data, error } = await supabase
    .from('user_credits')
    .update({ credits: currentCredits.credits - 1 })
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Log usage
  await supabase
    .from('credit_usage')
    .insert({
      user_id: user.id,
      action: 'route_calculation',
      timestamp: new Date().toISOString()
    });

  return data;
}

export async function addCredits(amount: number) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Get current credits
  const { data: currentCredits, error: fetchError } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  // Add credits
  const { data, error } = await supabase
    .from('user_credits')
    .update({ credits: currentCredits.credits + amount })
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

function getNextMonthDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}
