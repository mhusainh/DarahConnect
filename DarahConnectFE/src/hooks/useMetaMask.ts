import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState, MetaMaskError } from '../types/index';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const SUPPORTED_NETWORKS = {
  1: 'Ethereum Mainnet',
  11155111: 'Sepolia Testnet',
  137: 'Polygon Mainnet',
  80001: 'Polygon Mumbai',
};

export const useMetaMask = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    account: null,
    isConnected: false,
    isConnecting: false,
    error: null,
    balance: '0',
    network: null,
  });

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  };

  // Get network information
  const getNetworkInfo = async () => {
    if (!window.ethereum) return null;
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      return {
        chainId,
        name: SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS] || `Unknown (${chainId})`,
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      return null;
    }
  };

  // Get account balance
  const getBalance = async (account: string) => {
    if (!window.ethereum || !account) return '0';
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  };

  // Connect to MetaMask
  const connect = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setWalletState(prev => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to continue.',
      }));
      return;
    }

    setWalletState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const account = accounts[0];
        const balance = await getBalance(account);
        const network = await getNetworkInfo();

        setWalletState(prev => ({
          ...prev,
          account,
          isConnected: true,
          isConnecting: false,
          balance,
          network,
          error: null,
        }));
      }
    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to connect to MetaMask',
      }));
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setWalletState({
      account: null,
      isConnected: false,
      isConnecting: false,
      error: null,
      balance: '0',
      network: null,
    });
    localStorage.removeItem('walletConnected');
  }, []);

  // Send transaction
  const sendTransaction = useCallback(async (to: string, amount: string) => {
    if (!window.ethereum || !walletState.account) {
      throw new Error('MetaMask not connected');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const transaction = await signer.sendTransaction({
        to,
        value: ethers.parseEther(amount),
      });

      return transaction;
    } catch (error: any) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }, [walletState.account]);

  // Switch network
  const switchNetwork = useCallback(async (chainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      console.error('Error switching network:', error);
      if (error.code === 4902) {
        // Network not added to MetaMask
        throw new Error('This network is not added to your MetaMask. Please add it manually.');
      }
      throw error;
    }
  }, []);

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!isMetaMaskInstalled()) return;

      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0 && localStorage.getItem('walletConnected') === 'true') {
          const account = accounts[0];
          const balance = await getBalance(account);
          const network = await getNetworkInfo();

          setWalletState({
            account,
            isConnected: true,
            isConnecting: false,
            balance,
            network,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    };

    checkConnection();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== walletState.account) {
        const balance = await getBalance(accounts[0]);
        const network = await getNetworkInfo();
        
        setWalletState(prev => ({
          ...prev,
          account: accounts[0],
          balance,
          network,
        }));
      }
    };

    const handleChainChanged = async () => {
      const network = await getNetworkInfo();
      if (walletState.account) {
        const balance = await getBalance(walletState.account);
        setWalletState(prev => ({
          ...prev,
          network,
          balance,
        }));
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [walletState.account, disconnect]);

  // Save connection state
  useEffect(() => {
    if (walletState.isConnected) {
      localStorage.setItem('walletConnected', 'true');
    }
  }, [walletState.isConnected]);

  return {
    ...walletState,
    isMetaMaskInstalled: isMetaMaskInstalled(),
    connect,
    disconnect,
    sendTransaction,
    switchNetwork,
  };
}; 