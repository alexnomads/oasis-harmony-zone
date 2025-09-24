import { useEffect, useState } from 'react';
import { Twitter, Mail, Wallet, Link as LinkIcon, Unlink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { UserIdentity } from '@supabase/supabase-js';

export const ConnectedAccounts = () => {
  const [identities, setIdentities] = useState<UserIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, signInWithX } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserIdentities();
  }, [user]);

  const fetchUserIdentities = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase.auth.getUserIdentities();
      
      if (error) throw error;
      
      setIdentities(data?.identities || []);
    } catch (error) {
      console.error('Error fetching identities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load connected accounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccount = async (provider: 'twitter') => {
    try {
      if (provider === 'twitter') {
        await signInWithX();
      }
    } catch (error) {
      console.error('Error linking account:', error);
      toast({
        title: 'Error',
        description: 'Failed to link account',
        variant: 'destructive',
      });
    }
  };

  const handleUnlinkAccount = async (identity: UserIdentity) => {
    try {
      const { error } = await supabase.auth.unlinkIdentity(identity);
      
      if (error) throw error;
      
      await fetchUserIdentities();
      toast({
        title: 'Success',
        description: 'Account unlinked successfully',
      });
    } catch (error) {
      console.error('Error unlinking account:', error);
      toast({
        title: 'Error',
        description: 'Failed to unlink account',
        variant: 'destructive',
      });
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'twitter':
        return 'X (Twitter)';
      case 'email':
        return 'Email';
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  };

  const isTwitterConnected = identities.some(identity => identity.provider === 'twitter');

  if (loading) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
            <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          Connected Accounts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {identities.map((identity) => (
            <div key={identity.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                {getProviderIcon(identity.provider)}
                <div>
                  <p className="text-white font-medium">{getProviderName(identity.provider)}</p>
                  <p className="text-sm text-zinc-400">
                    {identity.identity_data?.email || identity.identity_data?.user_name || 'Connected'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Connected
                </Badge>
                {identities.length > 1 && identity.provider !== 'email' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnlinkAccount(identity)}
                    className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Unlink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {!isTwitterConnected && (
          <div className="pt-4 border-t border-zinc-700">
            <p className="text-sm text-zinc-400 mb-3">Link additional accounts for easier sign-in:</p>
            <Button
              onClick={() => handleLinkAccount('twitter')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              <Twitter className="w-4 h-4 mr-2" />
              Link X (Twitter) Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};