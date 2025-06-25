import React, { useState } from 'react';
import { useMetaMask } from '../hooks/useMetaMask';
import { Wallet, AlertCircle, CheckCircle, Copy, ExternalLink } from 'lucide-react';

interface MetaMaskWalletProps {
  className?: string;
  showBalance?: boolean;
  compact?: boolean;
}

export const MetaMaskWallet: React.FC<MetaMaskWalletProps> = ({
  className = '',
  showBalance = true,
  compact = false,
}) => {
  const {
    account,
    isConnected,
    isConnecting,
    error,
    balance,
    network,
    isMetaMaskInstalled,
    connect,
    disconnect,
  } = useMetaMask();

  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4);
  };

  if (!isMetaMaskInstalled) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="font-medium text-yellow-800">MetaMask Required</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Please install MetaMask to use wallet features.
            </p>
          </div>
        </div>
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors"
        >
          Install MetaMask
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-medium text-red-800">Connection Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={connect}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={`${className}`}>
        {compact ? (
          <button
            onClick={connect}
            disabled={isConnecting}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Wallet className="w-4 h-4" />
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600 mb-6">
              Connect your MetaMask wallet to participate in donations and access all features.
            </p>
            <button
              onClick={connect}
              disabled={isConnecting}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {compact ? (
        <div className="flex items-center gap-2">
          <div className="bg-green-100 p-1.5 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-900">
                {formatAddress(account!)}
              </span>
              <button
                onClick={copyAddress}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <Copy className="w-3 h-3" />
              </button>
              {copied && (
                <span className="text-xs text-green-600 font-medium">✓</span>
              )}
            </div>
            {showBalance && (
              <div className="text-xs text-gray-500">
                {formatBalance(balance)} ETH
              </div>
            )}
          </div>
          <button
            onClick={disconnect}
            className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800">Wallet Connected</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-green-700 font-mono">
                    {formatAddress(account!)}
                  </span>
                  <button
                    onClick={copyAddress}
                    className="text-green-600 hover:text-green-700 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {copied && (
                    <span className="text-xs text-green-600 font-medium">Copied!</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={disconnect}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Disconnect
            </button>
          </div>
          
          {showBalance && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-green-700 font-medium">Balance</p>
                  <p className="text-lg font-semibold text-green-800">
                    {formatBalance(balance)} ETH
                  </p>
                </div>
                {network && (
                  <div>
                    <p className="text-sm text-green-700 font-medium">Network</p>
                    <p className="text-sm text-green-800">{network.name}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetaMaskWallet; 