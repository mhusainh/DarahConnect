import React, { useState } from 'react';
import { useMetaMask } from '../hooks/useMetaMask';
import MetaMaskWallet from './MetaMaskWallet';
import { BloodCampaign } from '../types';
import { X, Send, Loader2, CheckCircle, AlertCircle, Wallet } from 'lucide-react';

interface CryptoDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: BloodCampaign | null;
  onSuccess?: (txHash: string) => void;
}

export const CryptoDonationModal: React.FC<CryptoDonationModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onSuccess,
}) => {
  const { isConnected, sendTransaction, account, network } = useMetaMask();
  const [amount, setAmount] = useState('');
  const [isTransacting, setIsTransacting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: '',
  });

  // Example recipient address (in real app, this would come from campaign data)
  const recipientAddress = '0x742d35Cc6635C0532925a3b8D39AED9A8B6a446B'; // Example address

  const predefinedAmounts = ['0.01', '0.05', '0.1', '0.5'];

  const handleAmountSelect = (selectedAmount: string) => {
    setAmount(selectedAmount);
  };

  const handleDonate = async () => {
    if (!campaign || !amount || !isConnected) return;

    setIsTransacting(true);
    setError(null);

    try {
      const transaction = await sendTransaction(recipientAddress, amount);
      setTxHash(transaction.hash);
      
      // Store donation info (in real app, this would be saved to backend)
      const donationRecord = {
        campaignId: campaign.id,
        donorAddress: account,
        amount,
        txHash: transaction.hash,
        timestamp: Date.now(),
        donorInfo,
        network: network?.name || 'Unknown',
      };
      
      console.log('Donation record:', donationRecord);
      
      if (onSuccess) {
        onSuccess(transaction.hash);
      }
    } catch (err: any) {
      console.error('Donation failed:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setIsTransacting(false);
    }
  };

  const resetModal = () => {
    setAmount('');
    setTxHash(null);
    setError(null);
    setIsTransacting(false);
    setDonorInfo({ name: '', email: '', message: '' });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                💎 Crypto Donation
              </h2>
              <p className="text-sm text-gray-600">Secure blockchain donation</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-white/50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {campaign && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">{campaign.title}</h3>
              <p className="text-sm text-gray-600">{campaign.hospital}</p>
              <p className="text-sm text-gray-600">{campaign.location}</p>
            </div>
          )}

          {/* Transaction Success */}
          {txHash && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-medium text-green-800">Donation Successful!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your donation has been submitted to the blockchain.
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-green-700 font-medium">Transaction Hash:</p>
                <p className="text-xs text-green-600 font-mono break-all bg-green-100 p-2 rounded mt-1">
                  {txHash}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium hover:bg-green-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <h3 className="font-medium text-red-800">Transaction Failed</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!txHash && (
            <>
              {/* Wallet Connection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Wallet Connection
                </h3>
                <MetaMaskWallet compact />
              </div>

              {isConnected && (
                <>
                  {/* Donor Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Donor Information (Optional)
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={donorInfo.name}
                        onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        value={donorInfo.email}
                        onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <textarea
                        placeholder="Message (Optional)"
                        value={donorInfo.message}
                        onChange={(e) => setDonorInfo({ ...donorInfo, message: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Amount Selection */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">
                      Donation Amount (ETH)
                    </h3>
                    
                    {/* Predefined amounts */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {predefinedAmounts.map((presetAmount) => (
                        <button
                          key={presetAmount}
                          onClick={() => handleAmountSelect(presetAmount)}
                          className={`py-2 px-3 text-sm font-medium rounded-md border transition-colors ${
                            amount === presetAmount
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {presetAmount} ETH
                        </button>
                      ))}
                    </div>

                    {/* Custom amount input */}
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="Enter custom amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Donation Button */}
                  <button
                    onClick={handleDonate}
                    disabled={!amount || isTransacting || parseFloat(amount) <= 0}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTransacting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Donate {amount} ETH
                      </>
                    )}
                  </button>

                  {/* Network Info */}
                  {network && (
                    <div className="text-xs text-gray-500 text-center">
                      Network: {network.name}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CryptoDonationModal; 