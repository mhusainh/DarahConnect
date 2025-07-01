import { postApi, ApiResponse } from './fetchApi';

interface WalletConnectionPayload {
  address: string;
  network: string;
  balance: string;
  timestamp: number;
}

interface WalletConnectionResponse {
  success: boolean;
  message: string;
  userId?: string;
  walletId?: string;
}

// Interface untuk request wallet address
export interface WalletAddressRequest {
  wallet_address: string;
}

// Interface untuk response wallet address
export interface WalletAddressResponse {
  message: string;
  wallet_address: string;
}

export const walletService = {
  // Connect wallet API call
  connectWallet: async (payload: WalletConnectionPayload): Promise<WalletConnectionResponse> => {
    try {
      // Example API endpoint - replace with your actual endpoint
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Wallet Connection',
          body: `Wallet ${payload.address} connected on ${payload.network}`,
          userId: 1,
          walletAddress: payload.address,
          network: payload.network,
          balance: payload.balance,
          timestamp: payload.timestamp,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Simulate successful response
      return {
        success: true,
        message: 'Wallet connected successfully',
        userId: data.userId?.toString(),
        walletId: data.id?.toString(),
      };
    } catch (error) {
      console.error('Wallet connection API error:', error);
      return {
        success: false,
        message: 'Failed to connect wallet to server',
      };
    }
  },

  // Disconnect wallet API call
  disconnectWallet: async (address: string): Promise<WalletConnectionResponse> => {
    try {
      // Example API endpoint - replace with your actual endpoint
      const response = await fetch('https://jsonplaceholder.typicode.com/posts/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        message: 'Wallet disconnected successfully',
      };
    } catch (error) {
      console.error('Wallet disconnection API error:', error);
      return {
        success: false,
        message: 'Failed to disconnect wallet from server',
      };
    }
  },

  // Get wallet info API call
  getWalletInfo: async (address: string): Promise<any> => {
    try {
      // Example API endpoint - replace with your actual endpoint
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/1`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          address,
          userId: data.userId,
          connectedAt: new Date().toISOString(),
          status: 'active',
        },
      };
    } catch (error) {
      console.error('Get wallet info API error:', error);
      return {
        success: false,
        message: 'Failed to get wallet info',
      };
    }
  },

  // Fungsi untuk menghubungkan wallet address ke backend
  connectWalletAddress: async (walletAddress: string): Promise<ApiResponse<WalletAddressResponse>> => {
    try {
      const response = await postApi<WalletAddressResponse>('/user/wallet-address', {
        wallet_address: walletAddress
      });
      
      return response;
    } catch (error) {
      console.error('Error connecting wallet address:', error);
      throw error;
    }
  },
};

// Fungsi terpisah untuk menghubungkan wallet address (untuk dipanggil dari halaman profile)
export const connectWalletAddress = async (walletAddress: string): Promise<ApiResponse<WalletAddressResponse>> => {
  try {
    const response = await postApi<WalletAddressResponse>('/user/wallet-address', {
      wallet_address: walletAddress
    });
    
    return response;
  } catch (error) {
    console.error('Error connecting wallet address:', error);
    throw error;
  }
};

export type { WalletConnectionPayload, WalletConnectionResponse }; 