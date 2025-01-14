import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Wallet } from "lucide-react";

export const RegisterForm = () => {
  const { toast } = useToast();

  const handleGmailLogin = async () => {
    toast({
      title: "Gmail Login",
      description: "Gmail login functionality will be implemented soon.",
    });
  };

  const handleWalletConnect = async () => {
    toast({
      title: "Connect Wallet",
      description: "Wallet connection functionality will be implemented soon.",
    });
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
          <CardTitle className="text-lg text-white text-center">Sign In</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
            onClick={handleWalletConnect}
          >
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};