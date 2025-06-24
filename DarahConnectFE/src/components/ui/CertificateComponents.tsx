import React, { useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Download, Share2, Award, Calendar, Heart, Shield, QrCode, Verified, Database, Hash, DownloadIcon, ShareIcon, HeartIcon, CalendarIcon, UserIcon, AwardIcon, PrinterIcon, Eye, CheckCircle, X } from 'lucide-react';
import { FadeIn, ScaleIn, Floating, HoverScale } from './AnimatedComponents';
import { MagneticButton, GlitchText } from './AdvancedAnimations';
import clsx from 'clsx';

interface DonorCertificateProps {
  donorName: string;
  bloodType: string;
  donationDate: string;
  donationCount: number;
  certificateId: string;
  hospital: string;
  className?: string;
}

export const DonorCertificate: React.FC<DonorCertificateProps> = ({
  donorName,
  bloodType,
  donationDate,
  donationCount,
  certificateId,
  hospital,
  className
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    // Simulate download process
    setTimeout(() => {
      setIsDownloading(false);
      // Here you would implement actual PDF generation
      alert('Sertifikat berhasil diunduh!');
    }, 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Sertifikat Donor Darah',
        text: `Saya telah mendonorkan darah untuk kemanusiaan! Ini adalah donasi ke-${donationCount} saya.`,
        url: window.location.href,
      });
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link sertifikat telah disalin ke clipboard!');
    }
  };

  return (
    <FadeIn direction="up" delay={0.2}>
      <div className={clsx('relative overflow-hidden', className)}>
        {/* Certificate Container */}
        <motion.div
          ref={certificateRef}
          className="bg-white border-8 border-double border-primary-600 rounded-xl p-8 shadow-2xl relative"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-200"></div>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <defs>
                <pattern id="hearts" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <HeartIcon className="w-4 h-4 text-primary-300" x="8" y="8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hearts)" />
            </svg>
          </div>

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <Floating intensity={3} duration={4}>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-4 shadow-lg">
                <HeartIcon className="w-10 h-10 text-white fill-current" />
              </div>
            </Floating>

            <GlitchText 
              text="SERTIFIKAT DONOR DARAH" 
              className="text-2xl font-bold text-primary-800 mb-2"
            />
            
            <motion.div
              className="w-32 h-1 bg-gradient-to-r from-primary-400 to-primary-600 mx-auto rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>

          {/* Content */}
          <div className="text-center space-y-6 relative z-10">
            <ScaleIn delay={0.6}>
              <div>
                <p className="text-lg text-gray-600 mb-2">Dengan bangga diberikan kepada</p>
                <h2 className="text-4xl font-bold text-gray-800 mb-2">{donorName}</h2>
                <p className="text-gray-600">atas kontribusi mulia dalam menyelamatkan nyawa</p>
              </div>
            </ScaleIn>

            <ScaleIn delay={0.8}>
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6 border border-primary-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <UserIcon className="w-5 h-5 text-primary-600 mr-1" />
                      <span className="text-sm font-medium text-gray-600">Golongan Darah</span>
                    </div>
                    <p className="text-xl font-bold text-primary-800">{bloodType}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <CalendarIcon className="w-5 h-5 text-primary-600 mr-1" />
                      <span className="text-sm font-medium text-gray-600">Tanggal</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800">
                      {new Date(donationDate).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <AwardIcon className="w-5 h-5 text-primary-600 mr-1" />
                      <span className="text-sm font-medium text-gray-600">Donasi Ke</span>
                    </div>
                    <p className="text-xl font-bold text-primary-800">{donationCount}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <HeartIcon className="w-5 h-5 text-primary-600 mr-1" />
                      <span className="text-sm font-medium text-gray-600">Rumah Sakit</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{hospital}</p>
                  </div>
                </div>
              </div>
            </ScaleIn>

            <ScaleIn delay={1.0}>
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  "Setetes darah Anda dapat menyelamatkan hingga 3 nyawa"
                </p>
                <div className="text-sm text-gray-500">
                  <p>ID Sertifikat: {certificateId}</p>
                  <p>Dikeluarkan pada: {new Date().toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            </ScaleIn>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 left-4 opacity-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <HeartIcon className="w-8 h-8 text-primary-400" />
            </motion.div>
          </div>

          <div className="absolute top-4 right-4 opacity-20">
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            >
              <AwardIcon className="w-8 h-8 text-primary-400" />
            </motion.div>
          </div>

          <div className="absolute bottom-4 left-4 opacity-20">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <CalendarIcon className="w-6 h-6 text-primary-400" />
            </motion.div>
          </div>

          <div className="absolute bottom-4 right-4 opacity-20">
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <UserIcon className="w-6 h-6 text-primary-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          <MagneticButton
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
            strength={0.3}
          >
            {isDownloading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <DownloadIcon className="w-5 h-5" />
              </motion.div>
            ) : (
              <DownloadIcon className="w-5 h-5" />
            )}
            <span>{isDownloading ? 'Mengunduh...' : 'Unduh PDF'}</span>
          </MagneticButton>

          <MagneticButton
            onClick={handleShare}
            className="flex items-center space-x-2 border border-primary-600 text-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors"
            strength={0.3}
          >
            <ShareIcon className="w-5 h-5" />
            <span>Bagikan</span>
          </MagneticButton>

          <MagneticButton
            onClick={() => window.print()}
            className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            strength={0.3}
          >
            <PrinterIcon className="w-5 h-5" />
            <span>Cetak</span>
          </MagneticButton>
        </div>
      </div>
    </FadeIn>
  );
};

// Certificate Gallery Component
interface CertificateGalleryProps {
  certificates: Array<{
    id: string;
    donorName: string;
    bloodType: string;
    donationDate: string;
    donationCount: number;
    hospital: string;
  }>;
}

export const CertificateGallery: React.FC<CertificateGalleryProps> = ({ certificates }) => {
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Galeri Sertifikat Donor</h2>
        <p className="text-gray-600">Kumpulan sertifikat penghargaan untuk para donor darah</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert, index) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer border border-gray-200"
            onClick={() => setSelectedCertificate(cert.id)}
          >
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <HeartIcon className="w-8 h-8 fill-current" />
                <span className="text-sm font-medium">#{cert.donationCount}</span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-900 mb-2">{cert.donorName}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Golongan Darah: <span className="font-medium">{cert.bloodType}</span></p>
                <p>Tanggal: <span className="font-medium">{new Date(cert.donationDate).toLocaleDateString('id-ID')}</span></p>
                <p>Rumah Sakit: <span className="font-medium">{cert.hospital}</span></p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Certificate Modal/Detail View would go here */}
      {selectedCertificate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCertificate(null)}
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {certificates.find(cert => cert.id === selectedCertificate) && (
              <DonorCertificate
                {...certificates.find(cert => cert.id === selectedCertificate)!}
                certificateId={selectedCertificate}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

// Achievement Badge Component
interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  progress?: number;
  className?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  title,
  description,
  icon,
  earned,
  progress = 0,
  className
}) => {
  return (
    <motion.div
      className={clsx(
        'relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden',
        earned 
          ? 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-orange-50 border-yellow-400 shadow-xl' 
          : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 shadow-md',
        'hover:shadow-2xl hover:scale-105',
        className
      )}
      whileHover={{ scale: 1.05 }}
      animate={earned ? { y: [0, -3, 0] } : {}}
      transition={{ duration: 3, repeat: earned ? Infinity : 0 }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 right-4 text-4xl">🏆</div>
        <div className="absolute bottom-4 left-4 text-3xl">⭐</div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl opacity-30">
          {earned ? '✨' : '🔒'}
        </div>
      </div>

      {/* Certificate-like border decoration */}
      {earned && (
        <>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400"></div>
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400"></div>
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-yellow-400 via-orange-400 to-yellow-400"></div>
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-yellow-400 via-orange-400 to-yellow-400"></div>
        </>
      )}

      {/* Icon with glow effect */}
      <div className={clsx(
        'relative inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transition-all duration-300',
        earned 
          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg' 
          : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-400'
      )}>
        {earned && (
          <div className="absolute inset-0 rounded-full bg-yellow-400 animate-pulse opacity-30"></div>
        )}
        <div className="relative z-10 text-2xl">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className={clsx(
          'text-xl font-bold mb-2 transition-colors',
          earned ? 'text-yellow-800' : 'text-gray-600'
        )}>
          {title}
        </h3>
        
        <p className={clsx(
          'text-sm mb-4 leading-relaxed',
          earned ? 'text-yellow-700' : 'text-gray-500'
        )}>
          {description}
        </p>

        {/* Progress Bar */}
        {!earned && progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600">Progress</span>
              <span className="text-xs font-medium text-gray-700">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Achievement Date (for earned badges) */}
        {earned && (
          <div className="text-center mt-4 pt-4 border-t border-yellow-200">
            <p className="text-xs text-yellow-600 font-medium">
              🎉 Diraih pada {new Date().toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        )}
      </div>

      {/* Earned Badge with animation */}
      {earned && (
        <motion.div
          className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 15,
            delay: 0.2
          }}
        >
          ✓ EARNED
        </motion.div>
      )}

      {/* Lock icon for unearned badges */}
      {!earned && (
        <div className="absolute top-4 right-4 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-500 text-sm">🔒</span>
        </div>
      )}

      {/* Sparkle animation for earned badges */}
      {earned && (
        <>
          <motion.div
            className="absolute top-2 left-8 w-2 h-2 bg-yellow-400 rounded-full"
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: 0
            }}
          />
          <motion.div
            className="absolute top-8 right-8 w-1 h-1 bg-orange-400 rounded-full"
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: 0.5
            }}
          />
          <motion.div
            className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-yellow-300 rounded-full"
            animate={{ 
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              delay: 1
            }}
          />
        </>
      )}
    </motion.div>
  );
};

interface BlockchainCertificate {
  id: string;
  blockchainId: string;
  transactionHash: string;
  timestamp: string;
  verified: boolean;
}

interface HealthPassportData {
  personalInfo: {
    name: string;
    bloodType: string;
    dateOfBirth: string;
    id: string;
  };
  medicalHistory: {
    lastCheckup: string;
    allergies: string[];
    medications: string[];
    conditions: string[];
  };
  donationHistory: {
    totalDonations: number;
    lastDonation: string;
    nextEligible: string;
  };
  vaccinations: {
    name: string;
    date: string;
    batch: string;
  }[];
  blockchainVerification: {
    passportId: string;
    hash: string;
    lastUpdated: string;
  };
}

// Health Passport Digital Component
export const HealthPassportDigital: React.FC<{ data: HealthPassportData }> = ({ data }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Health Passport Digital</h3>
            <p className="text-blue-100">Paspor Kesehatan Terverifikasi Blockchain</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Verified className="w-5 h-5 text-green-300" />
              <span className="text-sm">Terverifikasi</span>
            </div>
            <p className="text-xs text-blue-200">ID: {data.blockchainVerification.passportId}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'medical', label: 'Riwayat Medis', icon: Heart },
            { id: 'donations', label: 'Donor Darah', icon: Award },
            { id: 'blockchain', label: 'Blockchain', icon: Database }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Informasi Personal</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Nama Lengkap</span>
                    <p className="font-medium">{data.personalInfo.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Golongan Darah</span>
                    <p className="font-medium text-red-600">{data.personalInfo.bloodType}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Tanggal Lahir</span>
                    <p className="font-medium">{data.personalInfo.dateOfBirth}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Status Donor</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Total Donasi</span>
                    <p className="font-medium text-green-600">{data.donationHistory.totalDonations} kali</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Donasi Terakhir</span>
                    <p className="font-medium">{data.donationHistory.lastDonation}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Eligible Berikutnya</span>
                    <p className="font-medium">{data.donationHistory.nextEligible}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medical' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-yellow-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Alergi</h4>
                <div className="space-y-2">
                  {data.medicalHistory.allergies.map((allergy, index) => (
                    <span key={index} className="inline-block bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Obat-obatan</h4>
                <div className="space-y-2">
                  {data.medicalHistory.medications.map((medication, index) => (
                    <span key={index} className="inline-block bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                      {medication}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Riwayat Vaksinasi</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-green-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Vaksin</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Tanggal</th>
                      <th className="text-left py-2 text-sm font-medium text-gray-700">Batch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.vaccinations.map((vaccine, index) => (
                      <tr key={index} className="border-b border-green-100">
                        <td className="py-2 text-sm">{vaccine.name}</td>
                        <td className="py-2 text-sm">{vaccine.date}</td>
                        <td className="py-2 text-sm font-mono text-xs">{vaccine.batch}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blockchain' && (
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-purple-600" />
                Verifikasi Blockchain
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <span className="text-sm text-gray-600">Passport ID</span>
                  <p className="font-mono text-sm bg-white p-3 rounded-lg border">
                    {data.blockchainVerification.passportId}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Hash</span>
                  <p className="font-mono text-sm bg-white p-3 rounded-lg border break-all">
                    {data.blockchainVerification.hash}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600">Terakhir Diperbarui</span>
                <p className="font-medium">{data.blockchainVerification.lastUpdated}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">QR Code Verifikasi</h4>
              <div className="flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl border-2 border-gray-200">
                  <QrCode className="w-32 h-32 text-gray-400" />
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-4">
                Scan untuk verifikasi di blockchain
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Digital Certificate with Blockchain ID
export const DigitalCertificateWithBlockchain: React.FC<{
  donorName: string;
  donationDate: string;
  location: string;
  bloodType: string;
  volume: string;
  certificateNumber: string;
  blockchain: BlockchainCertificate;
}> = ({ donorName, donationDate, location, bloodType, volume, certificateNumber, blockchain }) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-2xl">
      {/* Header with Blockchain Verification */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 p-8 text-white relative">
        <div className="absolute top-4 right-4">
          <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
            <Verified className="w-4 h-4 text-green-300" />
            <span className="text-xs font-medium">Blockchain Verified</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <HeartIcon className="w-8 h-8 text-white fill-current" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Sertifikat Donor Darah</h2>
            <p className="text-red-100 mt-1">Digital Certificate - Blockchain Verified</p>
          </div>
        </div>
      </div>

      {/* Certificate Content */}
      <div className="p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Dengan bangga kami berikan kepada
          </h3>
          <h1 className="text-4xl font-bold text-red-600 mb-4">{donorName}</h1>
          <p className="text-lg text-gray-700">
            Atas kontribusi mulia dalam mendonorkan darah untuk menyelamatkan nyawa
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Detail Donasi</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Tanggal Donasi</span>
                <p className="font-medium">{donationDate}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Lokasi</span>
                <p className="font-medium">{location}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Golongan Darah</span>
                <p className="font-medium text-red-600">{bloodType}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Volume</span>
                <p className="font-medium">{volume}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Verifikasi Blockchain</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Blockchain ID</span>
                <p className="font-mono text-sm font-medium break-all">{blockchain.blockchainId}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Transaction Hash</span>
                <p className="font-mono text-xs font-medium break-all text-blue-600">{blockchain.transactionHash}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Timestamp</span>
                <p className="font-medium">{blockchain.timestamp}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  {blockchain.verified ? 'Verified on Blockchain' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Nomor Sertifikat</p>
              <p className="font-mono font-medium">{certificateNumber}</p>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Digital Certificate Component
interface SimpleDonorCertificateProps {
  donorName: string;
  bloodType: string;
  donationDate: string;
  donationCount: number;
  certificateId: string;
  hospital: string;
  blockchainId: string;
  className?: string;
}

export const SimpleDonorCertificate: React.FC<SimpleDonorCertificateProps> = ({
  donorName,
  bloodType,
  donationDate,
  donationCount,
  certificateId,
  hospital,
  blockchainId,
  className
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert('Sertifikat berhasil diunduh!');
    }, 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Sertifikat Donor Darah',
        text: `Saya telah mendonorkan darah untuk kemanusiaan! Ini adalah donasi ke-${donationCount} saya.`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link sertifikat telah disalin ke clipboard!');
    }
  };

  return (
    <FadeIn direction="up" delay={0.2}>
      <div className={clsx('relative overflow-hidden', className)}>
        {/* Certificate Container */}
        <motion.div
          className="bg-white border-4 border-red-500 rounded-2xl p-8 shadow-xl relative"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          {/* Decorative Corner Elements */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-red-500 rounded-tl-lg"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-red-500 rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-red-500 rounded-bl-lg"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-red-500 rounded-br-lg"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-4 shadow-lg">
              <HeartIcon className="w-10 h-10 text-white fill-current" />
            </div>
            
            <h1 className="text-3xl font-bold text-red-600 mb-2">SERTIFIKAT DONOR DARAH</h1>
            <div className="w-32 h-1 bg-red-500 mx-auto rounded-full"></div>
          </div>

          {/* Content */}
          <div className="text-center space-y-6">
            <div>
              <p className="text-lg text-gray-600 mb-2">Dengan bangga diberikan kepada</p>
              <h2 className="text-4xl font-bold text-gray-800 mb-2">{donorName}</h2>
              <p className="text-gray-600">atas kontribusi mulia dalam menyelamatkan nyawa</p>
            </div>

            {/* Details Grid */}
            <div className="bg-gray-50 rounded-xl p-6 mx-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Golongan Darah</div>
                  <div className="text-2xl font-bold text-red-600">{bloodType}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tanggal Donasi</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {new Date(donationDate).toLocaleDateString('id-ID')}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">Donasi Ke</div>
                  <div className="text-2xl font-bold text-red-600">{donationCount}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">Rumah Sakit</div>
                  <div className="text-sm font-semibold text-gray-800">{hospital}</div>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="italic text-gray-600 text-lg">
              "Setetes darah Anda dapat menyelamatkan hingga 3 nyawa"
            </div>

            {/* Certificate Info */}
            <div className="border-t border-gray-200 pt-6 space-y-3">
              <div>
                <span className="text-sm text-gray-600">ID Sertifikat: </span>
                <span className="font-mono font-medium">{certificateId}</span>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Blockchain ID: </span>
                <span className="font-mono font-medium text-blue-600">{blockchainId}</span>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Dikeluarkan pada: </span>
                <span className="font-medium">{new Date().toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Verified Badge */}
          <div className="absolute top-6 right-6">
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              <Verified className="w-4 h-4" />
              <span>Terverifikasi</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 hover:scale-105 shadow-lg"
          >
            {isDownloading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <DownloadIcon className="w-5 h-5" />
              </motion.div>
            ) : (
              <DownloadIcon className="w-5 h-5" />
            )}
            <span>{isDownloading ? 'Mengunduh...' : 'Unduh PDF'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center space-x-2 border border-red-600 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition-all duration-200 hover:scale-105"
          >
            <ShareIcon className="w-5 h-5" />
            <span>Bagikan</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all duration-200 hover:scale-105"
          >
            <PrinterIcon className="w-5 h-5" />
            <span>Cetak</span>
          </button>
        </div>
      </div>
    </FadeIn>
  );
};

// Simple Certificate Card for Dashboard/Lists
interface CertificateCardProps {
  donorName: string;
  bloodType: string;
  donationDate: string;
  donationCount: number;
  certificateId: string;
  blockchainId: string;
  type?: 'main' | 'achievement';
  title?: string;
  onClick?: () => void;
  className?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  donorName,
  bloodType,
  donationDate,
  donationCount,
  certificateId,
  blockchainId,
  type = 'main',
  title,
  onClick,
  className,
  approvalStatus = 'approved',
  approvedBy,
  approvedAt
}) => {
  const headerColor = type === 'main' ? 'from-red-600 to-red-700' : 'from-blue-600 to-blue-700';
  const icon = type === 'main' ? <HeartIcon className="w-6 h-6 text-white fill-current" /> : <AwardIcon className="w-6 h-6 text-white" />;

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getApprovalStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Disetujui';
      case 'pending': return 'Menunggu Persetujuan';
      case 'rejected': return 'Ditolak';
      default: return 'Unknown';
    }
  };

  return (
    <HoverScale scale={1.02}>
      <div 
        onClick={onClick}
        className={clsx(
          "bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300",
          className
        )}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${headerColor} p-6 text-white relative`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-bold">{title || 'Sertifikat Donor'}</h3>
              <p className={`${type === 'main' ? 'text-red-100' : 'text-blue-100'} text-sm`}>
                Digital Certificate
              </p>
            </div>
          </div>
          
          {/* Approval Status Badge */}
          <div className="absolute top-4 right-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getApprovalStatusColor(approvalStatus)}`}>
              {getApprovalStatusText(approvalStatus)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-4">
            <h4 className="text-xl font-bold text-gray-900 mb-2">{donorName}</h4>
            <p className="text-gray-600 text-sm">Donor Darah Terdaftar</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">Golongan Darah</p>
              <p className="text-lg font-bold text-red-600">{bloodType}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">Total Donasi</p>
              <p className="text-lg font-bold text-gray-900">{donationCount}</p>
            </div>
          </div>

          <div className="text-center mb-4">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mb-2">
              <Database className="w-3 h-3" />
              <span>Blockchain ID:</span>
            </div>
            <p className="text-xs font-mono text-blue-600 break-all">
              {blockchainId}
            </p>
          </div>

          {/* Approval Info */}
          {approvalStatus === 'approved' && approvedBy && (
            <div className="text-center border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500">Disetujui oleh: <span className="font-medium">{approvedBy}</span></p>
              {approvedAt && (
                <p className="text-xs text-gray-400">pada {new Date(approvedAt).toLocaleDateString('id-ID')}</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <AwardIcon className="w-4 h-4" />
            <span>Klik untuk melihat detail</span>
          </div>
        </div>
      </div>
    </HoverScale>
  );
};

// Admin Certificate Management Component
interface AdminCertificateCardProps {
  donorName: string;
  bloodType: string;
  donationDate: string;
  donationCount: number;
  certificateId: string;
  blockchainId: string;
  type?: 'main' | 'achievement';
  title?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  onApprove: (certificateId: string) => void;
  onReject: (certificateId: string) => void;
  onViewDetails: (certificateId: string) => void;
  className?: string;
}

export const AdminCertificateCard: React.FC<AdminCertificateCardProps> = ({
  donorName,
  bloodType,
  donationDate,
  donationCount,
  certificateId,
  blockchainId,
  type = 'main',
  title,
  approvalStatus,
  submittedAt,
  onApprove,
  onReject,
  onViewDetails,
  className
}) => {
  const headerColor = type === 'main' ? 'from-red-600 to-red-700' : 'from-blue-600 to-blue-700';
  const icon = type === 'main' ? <HeartIcon className="w-6 h-6 text-white fill-current" /> : <AwardIcon className="w-6 h-6 text-white" />;

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={clsx("bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden", className)}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${headerColor} p-4 text-white relative`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-bold">{title || 'Sertifikat Donor'}</h3>
              <p className={`${type === 'main' ? 'text-red-100' : 'text-blue-100'} text-sm`}>
                ID: {certificateId}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getApprovalStatusColor(approvalStatus)}`}>
            {approvalStatus === 'approved' ? 'Disetujui' : 
             approvalStatus === 'pending' ? 'Menunggu' : 'Ditolak'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Donor</p>
            <p className="font-semibold text-gray-900">{donorName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Golongan Darah</p>
            <p className="font-semibold text-red-600">{bloodType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tanggal Donasi</p>
            <p className="font-semibold text-gray-900">{new Date(donationDate).toLocaleDateString('id-ID')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Donasi Ke</p>
            <p className="font-semibold text-gray-900">{donationCount}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Blockchain ID</p>
          <p className="text-xs font-mono text-blue-600 break-all">{blockchainId}</p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">Diajukan pada</p>
          <p className="text-sm text-gray-900">{new Date(submittedAt).toLocaleString('id-ID')}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(certificateId)}
            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4 inline mr-1" />
            Detail
          </button>
          
          {approvalStatus === 'pending' && (
            <>
              <button
                onClick={() => onApprove(certificateId)}
                className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Setujui
              </button>
              
              <button
                onClick={() => onReject(certificateId)}
                className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <X className="w-4 h-4 inline mr-1" />
                Tolak
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 