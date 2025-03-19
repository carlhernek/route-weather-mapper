
import React from 'react';
import { Button } from '@/components/ui/button';
import { useSupabase } from '@/components/providers/SupabaseProvider';
import { LogIn, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const AuthButton = () => {
  const { user, signIn, signOut, isLoading } = useSupabase();
  const { toast } = useToast();

  const handleSignIn = async () => {
    try {
      await signIn('google');
    } catch (error) {
      toast({
        title: 'Sign in failed',
        description: 'Could not sign in with Google',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out',
        description: 'You have been signed out',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not sign out',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <Button variant="outline" disabled>Loading...</Button>;
  }

  if (!user) {
    return (
      <Button onClick={handleSignIn} variant="outline" className="gap-2">
        <LogIn className="h-4 w-4" />
        Sign in with Google
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <User className="h-4 w-4" />
          {user.user_metadata.name || user.email?.split('@')[0] || 'Account'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuItem>
          {user.email}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthButton;
