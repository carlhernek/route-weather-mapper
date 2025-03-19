
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { 
  getUserCredits, 
  addCredits, 
  creditPackages, 
  subscriptionPlans 
} from '@/lib/credits';
import { CreditCard, Package, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UserCredits {
  credits: number;
  next_reset: string;
}

const CreditManager = () => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSupabase();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadCredits();
    }
  }, [user]);

  const loadCredits = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const creditsData = await getUserCredits();
      setCredits(creditsData);
    } catch (error) {
      console.error('Error loading credits:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your credits',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (amount: number, packageName: string) => {
    try {
      setIsLoading(true);
      await addCredits(amount);
      toast({
        title: 'Purchase Successful',
        description: `You purchased the ${packageName} package and received ${amount} credits.`,
      });
      loadCredits();
    } catch (error) {
      toast({
        title: 'Purchase Failed',
        description: 'Could not process your purchase.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (plan: typeof subscriptionPlans[0]) => {
    try {
      setIsLoading(true);
      await addCredits(plan.credits);
      toast({
        title: 'Subscription Active',
        description: `You subscribed to ${plan.name} and received ${plan.credits} credits.`,
      });
      loadCredits();
    } catch (error) {
      toast({
        title: 'Subscription Failed',
        description: 'Could not process your subscription.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-4 bg-amber-50 border-amber-200">
        <p className="text-amber-800 text-center">
          Please sign in to manage your credits.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Your Credits</h3>
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${credits?.credits || 0} credits available`}
            </p>
            {credits?.next_reset && (
              <p className="text-xs text-muted-foreground mt-1">
                Next free credits: {new Date(credits.next_reset).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="text-2xl font-bold">
            {isLoading ? '...' : credits?.credits || 0}
          </div>
        </div>
      </Card>

      <Tabs defaultValue="packages">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packages">
            <Package className="h-4 w-4 mr-2" />
            Packages
          </TabsTrigger>
          <TabsTrigger value="subscriptions">
            <Calendar className="h-4 w-4 mr-2" />
            Subscriptions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="packages" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {creditPackages.map((pkg) => (
              <Card key={pkg.id} className="p-4 flex flex-col">
                <h3 className="font-semibold">{pkg.name}</h3>
                <p className="text-2xl font-bold my-2">{pkg.credits} credits</p>
                <p className="text-muted-foreground">{pkg.price} SEK</p>
                <Button 
                  onClick={() => handlePurchase(pkg.credits, pkg.name)}
                  className="mt-auto"
                  disabled={isLoading}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase
                </Button>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => handlePurchase(1, 'Single Credit')}
              disabled={isLoading}
            >
              Buy 1 credit for 1 SEK
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="subscriptions" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} className="p-4 flex flex-col">
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-2xl font-bold my-2">{plan.credits} credits/{plan.period}</p>
                <p className="text-muted-foreground">{plan.price} SEK/{plan.period}</p>
                <Button 
                  onClick={() => handleSubscribe(plan)}
                  className="mt-auto"
                  disabled={isLoading}
                >
                  Subscribe
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreditManager;
