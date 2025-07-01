import React from 'react';
import { useMetaMask } from '../hooks/useMetaMask';

const WalletDebugPanel: React.FC = () => {
  const {
    account,
    isConnected,
    isConnecting,
    error,
    balance,
    network,
    isMetaMaskInstalled,
    connect,
    disconnect
  } = useMetaMask();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="text-sm font-bold mb-2">🔧 Wallet Debug Panel</h3>
      
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-gray-400">MetaMask:</span>
          <span className={`ml-2 ${isMetaMaskInstalled ? 'text-green-400' : 'text-red-400'}`}>
            {isMetaMaskInstalled ? '✅ Installed' : '❌ Not Installed'}
          </span>
        </div>
        
        <div>
          <span className="text-gray-400">Status:</span>
          <span className={`ml-2 ${isConnected ? 'text-green-400' : isConnecting ? 'text-yellow-400' : 'text-red-400'}`}>
            {isConnected ? '✅ Connected' : isConnecting ? '⏳ Connecting' : '❌ Disconnected'}
          </span>
        </div>
        
        {account && (
          <div>
            <span className="text-gray-400">Account:</span>
            <span className="ml-2 text-blue-400 font-mono text-xs">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </div>
        )}
        
        {network && (
          <div>
            <span className="text-gray-400">Network:</span>
            <span className="ml-2 text-purple-400">
              {network.name} ({network.chainId})
            </span>
          </div>
        )}
        
        {balance && (
          <div>
            <span className="text-gray-400">Balance:</span>
            <span className="ml-2 text-green-400">
              {parseFloat(balance).toFixed(4)} ETH
            </span>
          </div>
        )}
        
        {error && (
          <div>
            <span className="text-gray-400">Error:</span>
            <span className="ml-2 text-red-400 text-xs">
              {error}
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-3 space-y-1">
        <button
          onClick={connect}
          disabled={isConnecting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : 'Connect'}
        </button>
        
        <button
          onClick={disconnect}
          disabled={!isConnected}
          className="w-full bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
        >
          Disconnect
        </button>
        
        <button
          onClick={() => {
            localStorage.removeItem('walletBannerDismissed');
            localStorage.removeItem('walletConnected');
            window.location.reload();
          }}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs"
        >
          Reset All
        </button>
      </div>
    </div>
  );
};

export default WalletDebugPanel; 