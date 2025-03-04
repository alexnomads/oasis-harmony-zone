
import { ethers } from 'ethers';

// Function to format wallet address for display
export const formatAddress = (address: string | null): string => {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

// Format ETH balance
export const formatBalance = (balance: string | number): string => {
  const balanceNum = typeof balance === 'string' ? parseFloat(balance) : balance;
  return balanceNum.toFixed(4);
};

// Check if network is supported
export const isSupportedNetwork = (chainId: number | null): boolean => {
  if (!chainId) return false;
  // Add the chain IDs you want to support
  const supportedNetworks = [1, 137, 56, 42161, 10]; // Ethereum, Polygon, BSC, Arbitrum, Optimism
  return supportedNetworks.includes(chainId);
};

// Switch to a specific network
export const switchNetwork = async (
  provider: ethers.providers.Web3Provider | null,
  targetChainId: number
): Promise<boolean> => {
  if (!provider || !window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${targetChainId.toString(16)}` }],
    });
    return true;
  } catch (error: any) {
    // If the chain hasn't been added to MetaMask
    if (error.code === 4902) {
      try {
        // Add the network (this would require network details)
        // This is a simplified example
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${targetChainId.toString(16)}`,
              chainName: getNetworkName(targetChainId),
              nativeCurrency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: [getNetworkRPC(targetChainId)],
              blockExplorerUrls: [getNetworkExplorer(targetChainId)],
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error('Error adding chain', addError);
        return false;
      }
    }
    console.error('Error switching chain', error);
    return false;
  }
};

// Helper functions for network info
function getNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    1: 'Ethereum Mainnet',
    137: 'Polygon Mainnet',
    56: 'Binance Smart Chain',
    42161: 'Arbitrum One',
    10: 'Optimism',
  };
  return networks[chainId] || 'Unknown Network';
}

function getNetworkRPC(chainId: number): string {
  const rpcs: Record<number, string> = {
    1: 'https://eth.llamarpc.com',
    137: 'https://polygon-rpc.com',
    56: 'https://bsc-dataseed.binance.org',
    42161: 'https://arb1.arbitrum.io/rpc',
    10: 'https://mainnet.optimism.io',
  };
  return rpcs[chainId] || '';
}

function getNetworkExplorer(chainId: number): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    137: 'https://polygonscan.com',
    56: 'https://bscscan.com',
    42161: 'https://arbiscan.io',
    10: 'https://optimistic.etherscan.io',
  };
  return explorers[chainId] || '';
}
