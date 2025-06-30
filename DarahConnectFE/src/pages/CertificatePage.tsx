import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WalletConnectBanner from "../components/WalletConnectBanner";
import {
  HeartIcon,
  CalendarIcon,
  AwardIcon,
  AlertTriangleIcon,
  BarChartIcon,
  UserIcon,
  TrophyIcon,
  PlusIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FadeIn, HoverScale } from "../components/ui/AnimatedComponents";
import { MagneticButton } from "../components/ui/AdvancedAnimations";

const CertificatePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("certificates");

  // Data sertifikat
  const certificates = [
    {
      id: "cert-001",
      type: "Sertifikat Donor",
      status: "Disetujui",
      name: "Husain Jancok2",
      role: "Donor Darah Terdaftar",
      bloodType: "O+",
      totalDonations: 12,
      blockchainId: "BC-CERT-0x9F8E7D6C5B4A",
      color: "red",
      bgGradient: "from-red-500 to-red-600",
    },
    {
      id: "cert-002",
      type: "Hero Donor",
      status: "Disetujui",
      name: "Husain Jancok2",
      role: "Donor Darah Terdaftar",
      bloodType: "O+",
      totalDonations: 10,
      blockchainId: "BC-04X6E-0x6E7D6C560A",
      color: "blue",
      bgGradient: "from-blue-500 to-blue-600",
    },
  ];

  const handleDonorSekarang = () => {
    navigate("/campaigns");
  };

  return (
    <>
      <WalletConnectBanner />
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Dashboard Tabs */}
        {/* <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 py-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === 'certificates';
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-red-600 border-b-2 border-red-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div> */}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FadeIn direction="up">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Sertifikat Donor Darah
              </h1>
              <p className="text-gray-600">
                Lihat dan kelola sertifikat donor darah Anda yang terverifikasi
                blockchain
              </p>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Certificates Grid */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certificates.map((cert) => (
                    <HoverScale key={cert.id} scale={1.02} duration={0.2}>
                      <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        {/* Certificate Header */}
                        <div
                          className={`bg-gradient-to-r ${cert.bgGradient} p-4 text-white relative`}
                        >
                          {/* Status Badge */}
                          <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              {cert.status}
                            </span>
                          </div>

                          {/* Certificate Icon */}
                          <div className="flex items-center space-x-3 mb-3">
                            {cert.color === "red" ? (
                              <HeartIcon className="w-8 h-8 fill-current" />
                            ) : (
                              <ShieldCheckIcon className="w-8 h-8" />
                            )}
                            <div>
                              <h3 className="font-bold text-lg">{cert.type}</h3>
                              <p className="text-sm opacity-90">
                                Digital Certificate
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Certificate Body */}
                        <div className="p-4">
                          {/* User Info */}
                          <div className="mb-4">
                            <h4 className="font-bold text-lg text-gray-900">
                              {cert.name}
                            </h4>
                            <p className="text-gray-600 text-sm">{cert.role}</p>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">
                                Golongan Darah
                              </p>
                              <p className="font-bold text-lg text-red-600">
                                {cert.bloodType}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">
                                Total Donasi
                              </p>
                              <p className="font-bold text-lg text-gray-900">
                                {cert.totalDonations}
                              </p>
                            </div>
                          </div>

                          {/* Blockchain Info */}
                          <div className="border-t border-gray-100 pt-3 mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
                              <span className="text-xs text-gray-500 uppercase tracking-wide">
                                Blockchain ID:
                              </span>
                            </div>
                            <p className="text-sm font-mono text-blue-600 break-all">
                              {cert.blockchainId}
                            </p>
                          </div>

                          {/* View Detail Link */}
                          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
                            <UserIcon className="w-4 h-4" />
                            <span>Klik untuk melihat detail</span>
                            <ExternalLinkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </HoverScale>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6">
                  {/* New Certificate CTA */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PlusIcon className="w-8 h-8 text-gray-400" />
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      Dapatkan Sertifikat Baru
                    </h3>

                    <p className="text-gray-600 text-sm mb-6">
                      Daftar donor darah untuk mendapatkan sertifikat digital
                      baru
                    </p>

                    <MagneticButton
                      onClick={handleDonorSekarang}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                      strength={0.3}
                    >
                      <HeartIcon className="w-4 h-4 fill-current" />
                      <span>Donor Sekarang</span>
                    </MagneticButton>
                  </div>
                </div>

                {/* Certificate Stats */}
                <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">
                    Statistik Sertifikat
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Sertifikat</span>
                      <span className="font-bold text-lg">
                        {certificates.length}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Terverifikasi</span>
                      <span className="font-bold text-lg text-green-600">
                        {certificates.length}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Blockchain</span>
                      <span className="font-bold text-lg text-blue-600">
                        100%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* View All Certificates Button */}
            {/* <div className="text-center mt-8">
              <MagneticButton
                onClick={() => console.log('View all certificates')}
                className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors inline-flex items-center space-x-2"
                strength={0.3}
              >
                <AwardIcon className="w-5 h-5" />
                <span>Lihat Semua Sertifikat</span>
              </MagneticButton>
            </div> */}
          </FadeIn>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CertificatePage;
