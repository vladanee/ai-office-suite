import { motion } from 'framer-motion';
import { Check, Crown, Zap, Building2, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription, PRICING_TIERS } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import { format } from 'date-fns';

const tierIcons = {
  free: Zap,
  pro: Crown,
  enterprise: Building2,
};

const tierColors = {
  free: 'bg-secondary',
  pro: 'bg-gradient-to-br from-primary to-primary/80',
  enterprise: 'bg-gradient-to-br from-amber-500 to-amber-600',
};

export function BillingSettingsTab() {
  const { subscription, isLoading, isCheckingOut, createCheckout, openCustomerPortal } = useSubscription();

  const handleUpgrade = async (tier: 'pro' | 'enterprise') => {
    if (tier === 'enterprise') {
      window.open('mailto:enterprise@aioffice.app?subject=Enterprise%20Plan%20Inquiry', '_blank');
      return;
    }

    const priceId = PRICING_TIERS[tier].price_id;
    if (!priceId) {
      toast.error('Price configuration error');
      return;
    }

    try {
      await createCheckout(priceId);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open billing portal. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your current subscription and billing details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${tierColors[subscription.tier]} flex items-center justify-center`}>
                {(() => {
                  const Icon = tierIcons[subscription.tier];
                  return <Icon className="w-6 h-6 text-white" />;
                })()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-foreground">
                    {PRICING_TIERS[subscription.tier].name} Plan
                  </p>
                  {subscription.tier !== 'free' && (
                    <Badge variant="default" className="bg-success text-success-foreground">
                      Active
                    </Badge>
                  )}
                </div>
                {subscription.subscription_end && (
                  <p className="text-sm text-muted-foreground">
                    Renews on {format(new Date(subscription.subscription_end), 'MMMM d, yyyy')}
                  </p>
                )}
                {subscription.tier === 'free' && (
                  <p className="text-sm text-muted-foreground">
                    Upgrade to unlock more features
                  </p>
                )}
              </div>
            </div>
            {subscription.subscribed && (
              <Button variant="outline" onClick={handleManageSubscription}>
                Manage Subscription
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that best fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.entries(PRICING_TIERS) as [keyof typeof PRICING_TIERS, typeof PRICING_TIERS[keyof typeof PRICING_TIERS]][]).map(([key, tier]) => {
              const Icon = tierIcons[key];
              const isCurrentPlan = subscription.tier === key;
              const isDowngrade = 
                (key === 'free' && subscription.tier !== 'free') ||
                (key === 'pro' && subscription.tier === 'enterprise');
              const isUpgrade = 
                (key === 'pro' && subscription.tier === 'free') ||
                (key === 'enterprise' && subscription.tier !== 'enterprise');

              return (
                <div
                  key={key}
                  className={`relative rounded-xl border-2 p-6 transition-all ${
                    isCurrentPlan 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {isCurrentPlan && (
                    <Badge 
                      className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary"
                    >
                      Current Plan
                    </Badge>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg ${tierColors[key]} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                  </div>

                  <div className="mb-6">
                    {tier.price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground">${tier.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    ) : (
                      <div className="text-xl font-semibold text-foreground">Contact Sales</div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : isUpgrade ? (
                    <Button 
                      className="w-full"
                      onClick={() => handleUpgrade(key as 'pro' | 'enterprise')}
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      {key === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                    </Button>
                  ) : isDowngrade ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleManageSubscription}
                    >
                      Manage Plan
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Not Available
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Month</CardTitle>
          <CardDescription>Track your resource usage against plan limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Workflows', used: 2, limit: subscription.tier === 'free' ? 3 : '∞' },
              { label: 'AI Personas', used: 3, limit: subscription.tier === 'free' ? 2 : '∞' },
              { label: 'Workflow Runs', used: 47, limit: subscription.tier === 'free' ? 100 : '∞' },
            ].map((stat) => (
              <div key={stat.label} className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.used} <span className="text-lg font-normal text-muted-foreground">/ {stat.limit}</span>
                </p>
                {typeof stat.limit === 'number' && (
                  <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${Math.min((stat.used / stat.limit) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
