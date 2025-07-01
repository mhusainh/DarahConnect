import React from 'react';
import { 
  HeartHandshakeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  MailIcon,
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon,
  DollarSignIcon,
  XIcon
} from 'lucide-react';
import { useState } from 'react';
import { postApi } from '../services/fetchApi';
import { useNotification } from '../hooks/useNotification';

const Footer: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donationAmount, setDonationAmount] = useState('');
  const { showSuccess, showError } = useNotification();

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setDonationAmount(formatted);
  };

  const handleDonation = async () => {
    if (isLoading) return;
    
    const numericAmount = parseInt(donationAmount.replace(/\./g, ''));
    
    if (!numericAmount || numericAmount < 10000) {
      showError('Nominal Tidak Valid', 'Minimal donasi adalah Rp 10.000');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await postApi('/user/donation/transaction', {
        amount: numericAmount
      });
      
      if (response.success && response.data?.redirect_url) {
        // Redirect ke halaman pembayaran Midtrans
        window.open(response.data.redirect_url.trim(), '_blank');
        setShowDonationForm(false);
        setDonationAmount('');
        showSuccess('Donasi Berhasil', 'Anda akan diarahkan ke halaman pembayaran');
      } else {
        showError('Donasi Gagal', response.error || 'Gagal memproses donasi');
      }
    } catch (error) {
      showError('Donasi Gagal', 'Terjadi kesalahan saat memproses donasi');
    } finally {
      setIsLoading(false);
    }
  };

  const openDonationForm = () => {
    setShowDonationForm(true);
    setDonationAmount('');
  };

  const closeDonationForm = () => {
    setShowDonationForm(false);
    setDonationAmount('');
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <HeartHandshakeIcon className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-2xl font-bold">DonorConnect</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Platform komunitas donor darah terpercaya di Indonesia. 
              Menghubungkan para hero donor dengan mereka yang membutuhkan bantuan.
            </p>
            
            <div className="flex space-x-4">
              <a href="javascript:void(0)" className="text-gray-400 hover:text-primary-500 transition-colors">
                <FacebookIcon className="w-6 h-6" />
              </a>
              <a href="javascript:void(0)" className="text-gray-400 hover:text-primary-500 transition-colors">
                <TwitterIcon className="w-6 h-6" />
              </a>
              <a href="javascript:void(0)" className="text-gray-400 hover:text-primary-500 transition-colors">
                <InstagramIcon className="w-6 h-6" />
              </a>
              <a href="javascript:void(0)" className="text-gray-400 hover:text-primary-500 transition-colors">
                <YoutubeIcon className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <a href="#campaigns" className="text-gray-300 hover:text-white transition-colors">
                  Campaign Aktif
                </a>
              </li>
              <li>
                <a href="#donors" className="text-gray-300 hover:text-white transition-colors">
                  Daftar Donor
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                  Tentang Kami
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-300 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#guidelines" className="text-gray-300 hover:text-white transition-colors">
                  Panduan Donor
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Kontak</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPinIcon className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-300">
                  Jl. Gatot Subroto No.123<br />
                  Jakarta Selatan 12950
                </span>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-300">+62 21 1234 5678</span>
              </div>
              <div className="flex items-center">
                <MailIcon className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-300">info@donorconnect.id</span>
              </div>
            </div>
          </div>
        </div>

        {/* Donation Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-3">Dukung Aplikasi Ini</h3>
            <p className="text-gray-300 mb-4 max-w-2xl mx-auto">
              Bantu kami terus mengembangkan platform DonorConnect untuk menyelamatkan lebih banyak nyawa.
              Donasi Anda sangat berarti bagi kami.
            </p>
            
            <button
              onClick={openDonationForm}
              className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <DollarSignIcon className="w-5 h-5 mr-2" />
              Donasi Sekarang
            </button>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2024 DonorConnect. Semua hak dilindungi.
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Kebijakan Privasi
            </a>
            <a href="#terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Syarat & Ketentuan
            </a>
            <a href="#help" className="text-gray-400 hover:text-white text-sm transition-colors">
              Bantuan
            </a>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {showDonationForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDonationForm}
        >
          <div 
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 w-full max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-white">Form Donasi</h4>
              <button
                onClick={closeDonationForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nominal Donasi (Minimum Rp 10.000)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  Rp
                </span>
                <input
                  type="text"
                  value={donationAmount}
                  onChange={handleAmountChange}
                  placeholder="10.000"
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={closeDonationForm}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDonation}
                disabled={isLoading || !donationAmount}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {isLoading ? 'Memproses...' : 'Lanjut Bayar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;