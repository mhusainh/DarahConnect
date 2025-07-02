import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface MetaMaskInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MetaMaskInstallModal: React.FC<MetaMaskInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleInstallClick = () => {
    // Open MetaMask download page
    window.open('https://metamask.io/download/', '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-orange-600" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            MetaMask Belum Terinstall
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            Untuk menghubungkan wallet, Anda perlu menginstall MetaMask extension terlebih dahulu.
          </p>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handleInstallClick}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Install MetaMask
              <ExternalLink className="w-4 h-4 ml-2" />
            </button>

            <button
              onClick={handleClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-medium transition-colors"
            >
              Tutup
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-4 rounded-lg">
            <p className="mb-3 font-medium text-gray-700">
              📋 Langkah setelah install:
            </p>
            <ol className="text-left space-y-2">
              <li className="flex items-start">
                <span className="bg-orange-100 text-orange-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</span>
                <span>Install MetaMask dari link di atas</span>
              </li>
              <li className="flex items-start">
                <span className="bg-orange-100 text-orange-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>
                <span>Buat atau import wallet di MetaMask</span>
              </li>
              <li className="flex items-start">
                <span className="bg-orange-100 text-orange-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>
                <span>Kembali ke halaman ini dan refresh halaman</span>
              </li>
              <li className="flex items-start">
                <span className="bg-orange-100 text-orange-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">4</span>
                <span>Klik "Hubungkan Wallet" lagi dan anda akan diarahkan ke halaman login kembali</span>
              </li>
            </ol>
          </div>

          {/* Additional info */}
          <div className="mt-4 text-xs text-gray-400">
            <p>
              💡 MetaMask adalah wallet crypto yang aman dan populer untuk mengakses aplikasi blockchain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetaMaskInstallModal; 