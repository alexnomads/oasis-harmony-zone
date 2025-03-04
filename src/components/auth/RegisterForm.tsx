
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Wallet, LogOut, ExternalLink } from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";
import { formatAddress, formatBalance } from "@/utils/web3Utils";

export const RegisterForm = () => {
  const { toast } = useToast();
  const { account, connectWallet, disconnectWallet, isConnecting, balance } = useWeb3();

  const handleGmailLogin = async () => {
    toast({
      title: "Gmail Login",
      description: "Gmail login functionality will be implemented soon.",
    });
  };

  const handleViewOnExplorer = () => {
    if (!account) return;
    
    // Default to Ethereum
    const explorerUrl = `https://etherscan.io/address/${account}`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-[280px]"
    >
      <Card className="bg-zinc-900/90 border-zinc-800 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white text-center">
            {account ? "Wallet Connected" : "Sign In"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!account ? (
            <>
              <Button 
                variant="outline" 
                className="w-full bg-white/5 border-zinc-700 hover:bg-white/10 text-white"
                onClick={handleGmailLogin}
              >
                <Mail className="mr-2 h-4 w-4" />
                Continue with Gmail
              </Button>
              <Button 
                variant="outline"
                className="w-full bg-white/5 border-zinc-700 hover:bg-white/10 text-white"
                onClick={connectWallet}
                disabled={isConnecting}
              >
                <Wallet className="mr-2 h-4 w-4" />
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </Button>
            </>
          ) : (
            <>
              <div className="bg-white/5 p-3 rounded-lg mb-2">
                <p className="text-sm text-white/70 mb-1">Address</p>
                <p className="text-white font-medium truncate">{formatAddress(account)}</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg mb-3">
                <p className="text-sm text-white/70 mb-1">Balance</p>
                <p className="text-white font-medium">{formatBalance(balance)} ETH</p>
              </div>
              <Button 
                variant="outline"
                className="w-full bg-white/5 border-zinc-700 hover:bg-white/10 text-white"
                onClick={handleViewOnExplorer}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Explorer
              </Button>
              <Button 
                variant="outline"
                className="w-full bg-white/5 border-zinc-700 hover:bg-white/10 text-white"
                onClick={disconnectWallet}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
