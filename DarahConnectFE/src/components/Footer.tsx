import React from 'react';
import { 
  HeartHandshakeIcon, 
  MapPinIcon, 
  PhoneIcon, 
  MailIcon,
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <HeartHandshakeIcon className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-2xl font-bold">DonorKita</span>
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
                <span className="text-gray-300">info@donorkita.id</span>
              </div>
            </div>
          </div>
        </div>

        {/* Partners */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <h3 className="text-lg font-semibold mb-6 text-center">Partner Resmi</h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="text-gray-400 text-sm font-medium">PMI Indonesia</div>
            <div className="text-gray-400 text-sm font-medium">Kementerian Kesehatan RI</div>
            <div className="text-gray-400 text-sm font-medium">RS Cipto Mangunkusumo</div>
            <div className="text-gray-400 text-sm font-medium">RS Persahabatan</div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2024 DonorKita. Semua hak dilindungi.
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
    </footer>
  );
};

export default Footer; 