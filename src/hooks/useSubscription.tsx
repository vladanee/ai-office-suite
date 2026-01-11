import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SubscriptionData {
  subscribed: boolean;
  tier: 'free' | 'pro' | 'enterprise';
  product_id: string | null;
  subscription_end: string | null;
}

export const PRICING_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    price_id: null,
    product_id: null,
    features: [
      '3 workflows',
      '2 AI personas',
      '100 workflow runs/month',
      'Community support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 29,
    price_id: 'price_1SoRWZF8I26ocYfw9rBfOzZy',
    product_id: 'prod_TlzVVs8QXxuoJ8',
    features: [
      'Unlimited workflows',
      'Unlimited AI personas',
      'Unlimited workflow runs',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: null, // Contact sales
    price_id: null,
    product_id: null,
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom SLA',
      'SSO/SAML',
      'Audit logs',
      'Custom contracts',
    ],
  },
} as const;

export function useSubscription() {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const { data: subscription, isLoading, refetch } = useQuery<SubscriptionData>({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!session?.access_token) {
        return { subscribed: false, tier: 'free', product_id: null, subscription_end: null };
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        return { subscribed: false, tier: 'free', product_id: null, subscription_end: null };
      }

      return data as SubscriptionData;
    },
    enabled: !!user && !!session,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // Refetch every minute
  });

  const createCheckout = useCallback(async (priceId: string) => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { priceId },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } finally {
      setIsCheckingOut(false);
    }
  }, [session]);

  const openCustomerPortal = useCallback(async () => {
    if (!session?.access_token) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('customer-portal', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
  }, [session]);

  // Refetch on URL params (after checkout)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      refetch();
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [refetch]);

  return {
    subscription: subscription || { subscribed: false, tier: 'free', product_id: null, subscription_end: null },
    isLoading,
    isCheckingOut,
    createCheckout,
    openCustomerPortal,
    refetch,
  };
}
