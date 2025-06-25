import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HeartIcon, AwardIcon, TrophyIcon, StarIcon, GiftIcon, UserIcon, CalendarIcon, DownloadIcon, ShareIcon } from 'lucide-react';
import { DonorCertificate, CertificateGallery, AchievementBadge, DigitalCertificateWithBlockchain } from '../components/ui/CertificateComponents';
import { FadeIn, StaggerContainer, StaggerItem, CountUp, HoverScale } from '../components/ui/AnimatedComponents';
import { MagneticButton, GradientBackground } from '../components/ui/AdvancedAnimations';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CertificatePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [selectedTab, setSelectedTab] = useState<'certificates' | 'achievements' | 'statistics'>('certificates');

  // Handle URL tab changes
  useEffect(() => {
    if (tabFromUrl && ['certificates', 'achievements', 'statistics'].includes(tabFromUrl)) {
      setSelectedTab(tabFromUrl as 'certificates' | 'achievements' | 'statistics');
    }
  }, [tabFromUrl]);

  const handleDownload = () => {
    alert('Mengunduh sertifikat PDF...');
  };

  const handleShare = () => {
    alert('Membagikan sertifikat...');
  };

  // Mock data - in real app this would come from API
  const donorData = {
    name: 'Ahmad Suryadi',
    bloodType: 'O+',
    totalDonations: 12,
    lastDonation: '2024-01-15',
    totalLivesSaved: 36,
    preferredHospital: 'RS Hasan Sadikin',
    registrationDate: '2020-03-15'
  };

  // Blockchain certificate data
  const blockchainCertificates = [
    {
      id: 'CERT-2024-001',
      blockchainId: 'BC-CERT-0x9F8E7D6C5B4A',
      transactionHash: '0x7f8e9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e',
      timestamp: '15 Januari 2024, 09:15 WIB',
      verified: true
    },
    {
      id: 'CERT-2023-012',
      blockchainId: 'BC-CERT-0x8E7D6C5B4A9F',
      transactionHash: '0x6e7d8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e',
      timestamp: '20 Oktober 2023, 14:45 WIB',
      verified: true
    },
    {
      id: 'CERT-2023-007',
      blockchainId: 'BC-CERT-0x7D6C5B4A9F8E',
      transactionHash: '0x5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e',
      timestamp: '10 Juli 2023, 11:30 WIB',
      verified: true
    }
  ];

  const certificates = [
    {
      id: 'cert-001',
      donorName: donorData.name,
      bloodType: donorData.bloodType,
      donationDate: '2024-01-15',
      donationCount: 12,
      hospital: 'RS Hasan Sadikin',
      location: 'Jl. Pasteur No. 38, Bandung',
      volume: '450 ml',
      certificateNumber: 'CERT-2024-001',
      blockchain: blockchainCertificates[0]
    },
    {
      id: 'cert-002',
      donorName: donorData.name,
      bloodType: donorData.bloodType,
      donationDate: '2023-10-20',
      donationCount: 11,
      hospital: 'RS Hasan Sadikin',
      location: 'Jl. Pasteur No. 38, Bandung',
      volume: '450 ml',
      certificateNumber: 'CERT-2023-012',
      blockchain: blockchainCertificates[1]
    },
    {
      id: 'cert-003',
      donorName: donorData.name,
      bloodType: donorData.bloodType,
      donationDate: '2023-07-10',
      donationCount: 10,
      hospital: 'RS Hasan Sadikin',
      location: 'Jl. Pasteur No. 38, Bandung',
      volume: '450 ml',
      certificateNumber: 'CERT-2023-007',
      blockchain: blockchainCertificates[2]
    }
  ];

  const achievements = [
    {
      title: 'Donor Pertama',
      description: 'Menyelesaikan donasi darah pertama',
      icon: <HeartIcon className="w-8 h-8" />,
      earned: true
    },
    {
      title: 'Hero Kecil',
      description: 'Melakukan 5 kali donasi darah',
      icon: <StarIcon className="w-8 h-8" />,
      earned: true
    },
    {
      title: 'Hero Sejati',
      description: 'Melakukan 10 kali donasi darah',
      icon: <TrophyIcon className="w-8 h-8" />,
      earned: true
    },
    {
      title: 'Super Hero',
      description: 'Melakukan 20 kali donasi darah',
      icon: <AwardIcon className="w-8 h-8" />,
      earned: false,
      progress: 60
    },
    {
      title: 'Konsisten',
      description: 'Donasi rutin selama 2 tahun berturut-turut',
      icon: <CalendarIcon className="w-8 h-8" />,
      earned: true
    },
    {
      title: 'Hadiah Spesial',
      description: 'Mencapai 25 kali donasi darah',
      icon: <GiftIcon className="w-8 h-8" />,
      earned: false,
      progress: 48
    }
  ];

  const statistics = [
    { label: 'Total Donasi', value: donorData.totalDonations, icon: <HeartIcon />, color: 'text-red-600' },
    { label: 'Nyawa Diselamatkan', value: donorData.totalLivesSaved, icon: <UserIcon />, color: 'text-green-600' },
    { label: 'Tahun Bergabung', value: new Date().getFullYear() - new Date(donorData.registrationDate).getFullYear(), icon: <CalendarIcon />, color: 'text-blue-600' },
    { label: 'Sertifikat Diterima', value: certificates.length, icon: <AwardIcon />, color: 'text-yellow-600' }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <GradientBackground className="py-16" animated={false}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn direction="up">
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Sertifikat & Pencapaian Donor
                </h1>
                <p className="text-xl mb-8 opacity-90">
                  Koleksi sertifikat blockchain dan pencapaian Anda dalam berdonor darah
                </p>
              </div>
            </FadeIn>
          </div>
        </GradientBackground>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          {/* Profile Card */}
          <FadeIn direction="up" delay={0.2}>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Sertifikat Donasi Darah</h2>
                  <p className="text-gray-600 mt-1">Apresiasi untuk kontribusi mulia Anda</p>
                </div>
                <div className="flex items-center space-x-4">
                  <MagneticButton
                    onClick={handleDownload}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
                    strength={0.2}
                  >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Unduh PDF</span>
                  </MagneticButton>
                  
                  <MagneticButton
                    onClick={handleShare}
                    className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    strength={0.2}
                  >
                    <ShareIcon className="w-4 h-4" />
                    <span>Bagikan</span>
                  </MagneticButton>
                </div>
              </div>
              
              <DonorCertificate 
                donorName={certificates[0].donorName}
                bloodType={certificates[0].bloodType}
                donationDate={certificates[0].donationDate}
                donationCount={certificates[0].donationCount}
                certificateId={certificates[0].certificateNumber}
                hospital={certificates[0].hospital}
              />
            </div>
          </FadeIn>

          {/* Navigation Tabs */}
          <FadeIn direction="up" delay={0.3}>
            <div className="bg-white rounded-lg shadow-sm p-1 mb-8">
              <div className="flex space-x-1">
                {[
                  { key: 'certificates', label: 'Sertifikat Blockchain', icon: <AwardIcon className="w-5 h-5" /> },
                  { key: 'achievements', label: 'Pencapaian', icon: <TrophyIcon className="w-5 h-5" /> },
                  { key: 'statistics', label: 'Statistik', icon: <StarIcon className="w-5 h-5" /> }
                ].map((tab) => (
                  <MagneticButton
                    key={tab.key}
                    onClick={() => setSelectedTab(tab.key as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                      selectedTab === tab.key
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    strength={0.2}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </MagneticButton>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Tab Content */}
          <div className="mb-12">
            {selectedTab === 'certificates' && (
              <FadeIn direction="up" delay={0.1}>
                <div className="space-y-8">
                  {/* Latest Certificate */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                      Sertifikat Blockchain Terbaru
                    </h3>
                    <div className="flex justify-center">
                      <DigitalCertificateWithBlockchain
                        donorName={donorData.name}
                        donationDate={donorData.lastDonation}
                        location={certificates[0].location}
                        bloodType={donorData.bloodType}
                        volume={certificates[0].volume}
                        certificateNumber={certificates[0].certificateNumber}
                        blockchain={certificates[0].blockchain}
                      />
                    </div>
                  </div>

                  {/* All Certificates */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                      Semua Sertifikat Blockchain
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {certificates.slice(1).map((cert, index) => (
                        <div key={cert.id} className="flex justify-center">
                          <DigitalCertificateWithBlockchain
                            donorName={cert.donorName}
                            donationDate={cert.donationDate}
                            location={cert.location}
                            bloodType={cert.bloodType}
                            volume={cert.volume}
                            certificateNumber={cert.certificateNumber}
                            blockchain={cert.blockchain}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}

            {selectedTab === 'achievements' && (
              <FadeIn direction="up" delay={0.1}>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Pencapaian & Badge
                  </h3>
                  
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
                    {achievements.map((achievement, index) => (
                      <StaggerItem key={index}>
                        <AchievementBadge {...achievement} />
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </FadeIn>
            )}

            {selectedTab === 'statistics' && (
              <FadeIn direction="up" delay={0.1}>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Statistik Donasi
                  </h3>
                  
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" staggerDelay={0.1}>
                    {statistics.map((stat, index) => (
                      <StaggerItem key={index}>
                        <HoverScale scale={1.05}>
                          <div className="bg-white rounded-xl p-6 shadow-md text-center">
                            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${stat.color.replace('text', 'bg').replace('600', '100')}`}>
                              <div className={stat.color}>
                                {stat.icon}
                              </div>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-2">
                              <CountUp end={stat.value} duration={2} delay={index * 0.2} />
                            </div>
                            <p className="text-gray-600 text-sm">{stat.label}</p>
                          </div>
                        </HoverScale>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>

                  {/* Impact Visualization */}
                  <div className="bg-white rounded-xl p-8 shadow-md">
                    <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">
                      Dampak Donasi Anda
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <HeartIcon className="w-10 h-10 text-red-600 fill-current" />
                        </div>
                        <h5 className="font-bold text-lg mb-2">Darah yang Didonasikan</h5>
                        <p className="text-2xl font-bold text-red-600">
                          <CountUp end={donorData.totalDonations * 450} suffix=" ml" duration={2} />
                        </p>
                        <p className="text-gray-600 text-sm">Total volume darah</p>
                      </div>

                      <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <UserIcon className="w-10 h-10 text-green-600" />
                        </div>
                        <h5 className="font-bold text-lg mb-2">Nyawa Diselamatkan</h5>
                        <p className="text-2xl font-bold text-green-600">
                          <CountUp end={donorData.totalLivesSaved} suffix=" nyawa" duration={2} delay={0.5} />
                        </p>
                        <p className="text-gray-600 text-sm">Estimasi nyawa terselamatkan</p>
                      </div>

                      <div className="text-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CalendarIcon className="w-10 h-10 text-blue-600" />
                        </div>
                        <h5 className="font-bold text-lg mb-2">Pengalaman Donor</h5>
                        <p className="text-2xl font-bold text-blue-600">
                          <CountUp 
                            end={Math.floor((new Date().getTime() - new Date(donorData.registrationDate).getTime()) / (1000 * 60 * 60 * 24))} 
                            suffix=" hari" 
                            duration={2} 
                            delay={1} 
                          />
                        </p>
                        <p className="text-gray-600 text-sm">Sejak menjadi donor</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CertificatePage; 