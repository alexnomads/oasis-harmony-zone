
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/components/ui/use-toast';

type Web3ContextType = {
  account: string | null;
  chainId: number | null;
  provider: ethers.providers.Web3Provider | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  balance: string;
};

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState('');
  const { toast } = useToast();

  // Check if wallet was previously connected
  useEffect(() => {
    const storedAccount = localStorage.getItem('connectedAccount');
    if (storedAccount) {
      connectWallet();
    }
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsConnecting(true);
        
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
        const network = await ethersProvider.getNetwork();
        const walletBalance = await ethersProvider.getBalance(accounts[0]);
        const formattedBalance = ethers.utils.formatEther(walletBalance);
        
        // Save account info
        setAccount(accounts[0]);
        setChainId(network.chainId);
        setProvider(ethersProvider);
        setBalance(formattedBalance);
        
        // Store connected account in localStorage
        localStorage.setItem('connectedAccount', accounts[0]);
        
        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
        });
        
        // Setup listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        window.ethereum.on('disconnect', disconnectWallet);
        
      } catch (error) {
        console.error('Error connecting wallet:', error);
        toast({
          title: "Connection Failed",
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsConnecting(false);
      }
    } else {
      toast({
        title: "Wallet Not Found",
        description: "Please install a Web3 wallet like MetaMask to continue.",
        variant: "destructive",
      });
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setBalance('');
    localStorage.removeItem('connectedAccount');
    
    // Remove listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('disconnect', disconnectWallet);
    }
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  // Handle account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
      localStorage.setItem('connectedAccount', accounts[0]);
      
      if (provider) {
        provider.getBalance(accounts[0]).then(bal => {
          setBalance(ethers.utils.formatEther(bal));
        });
      }
    }
  };

  // Handle chain changes
  const handleChainChanged = (chainIdHex: string) => {
    window.location.reload();
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        provider,
        connectWallet,
        disconnectWallet,
        isConnecting,
        balance,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
