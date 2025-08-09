import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import BackgroundSertifikat from "../assets/background_sertifikat.png";
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
  DownloadIcon,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FadeIn, HoverScale } from "../components/ui/AnimatedComponents";
import { MagneticButton } from "../components/ui/AdvancedAnimations";
import { fetchApi } from "../services/fetchApi";

const CertificatePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("certificates");
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloadTarget, setDownloadTarget] = useState<any>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchApi("/user/certificates");
        if (res.success && Array.isArray(res.data)) {
          // Map API data ke struktur UI
          setCertificates(
            res.data.map((item: any, idx: number) => ({
              id: item.id,
              type: "Sertifikat Donor",
              status: "Disetujui",
              name: item.user?.name || "-",
              role: item.user?.role || "-",
              bloodType: item.user?.blood_type || "-",
              totalDonations: item.donation?.amount || 1,
              blockchainId:
                item.digital_signature ||
                item.digitalSignature ||
                item.blockchain_id ||
                "-",
              certificateNumber: item.certificate_number || "-",
              digitalSignature: item.digital_signature || "-",
              color: idx % 2 === 0 ? "red" : "blue",
              bgGradient:
                idx % 2 === 0
                  ? "from-red-500 to-red-600"
                  : "from-blue-500 to-blue-600",
              createdAt: item.created_at,
              rawData: item,
            }))
          );
        } else {
          setError(res.message || "Gagal mengambil data sertifikat");
        }
      } catch (err: any) {
        setError(err.message || "Gagal mengambil data sertifikat");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  useEffect(() => {
    if (downloadTarget) {
      console.log("DOWNLOAD TARGET:", downloadTarget);
      setTimeout(() => {
        downloadCertificateAsImage(downloadTarget);
      }, 200);
    }
    // eslint-disable-next-line
  }, [downloadTarget]);

  const handleDonorSekarang = () => {
    navigate("/campaigns");
  };

  const handleViewCertificateDetail = (certificate: any) => {
    setSelectedCertificate(certificate);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCertificate(null);
  };

  const downloadCertificateAsImage = async (certificate: any) => {
    if (!certificateRef.current) return;
    setDownloading(true);
    try {
      await new Promise((res) => setTimeout(res, 200)); // delay agar render selesai
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 800,
        height: 600,
        scrollX: 0,
        scrollY: 0,
      });
      const link = document.createElement("a");
      link.download = `sertifikat-donor-${certificate.name}-${certificate.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setDownloadTarget(null);
    } catch (error) {
      alert("Gagal mengunduh sertifikat. Silakan coba lagi.");
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <WalletConnectBanner />
      <Header />
      <div className="min-h-screen bg-gray-50">
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

            {/* Loading & Error State */}
            {loading && (
              <div className="text-center py-12 text-gray-500">
                Memuat data sertifikat...
              </div>
            )}
            {error && (
              <div className="text-center py-12 text-red-500">{error}</div>
            )}

            {/* Content Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Certificates Grid */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map((cert) => (
                      <HoverScale key={cert.id} scale={1.02} duration={0.2}>
                        <div
                          className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
                          onClick={() => handleViewCertificateDetail(cert)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleViewCertificateDetail(cert);
                            }
                          }}
                        >
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
                                <h3 className="font-bold text-lg">
                                  {cert.type}
                                </h3>
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
                              <p className="text-gray-600 text-sm">
                                {cert.role}
                              </p>
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
                                <a
                                  href={`https://sepolia.etherscan.io/tx/${cert.digitalSignature}`}
                                  target="_blank"
                                  rel="nofollow noopener noreferrer"
                                  className="underline hover:text-blue-800"
                                >
                                  {cert.blockchainId}
                                </a>
                              </p>
                              <div className="flex items-center space-x-2 mb-2 mt-2">
                                <span className="text-xs text-gray-500 uppercase tracking-wide">
                                  Certificate Number:
                                </span>
                              </div>
                              <p className="text-sm font-mono text-gray-800 break-all">
                                {cert.certificateNumber}
                              </p>
                            </div>

                            {/* Download Certificate Buttons */}
                            <div className="flex space-x-2 mb-2">
                              <button
                                className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-xs font-medium transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDownloadTarget(cert);
                                }}
                                disabled={downloading}
                              >
                                {downloading ? (
                                  <>
                                    <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Mengunduh...</span>
                                  </>
                                ) : (
                                  <>
                                    <DownloadIcon className="w-3 h-3" />
                                    <span>PNG</span>
                                  </>
                                )}
                              </button>
                              <button
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const dataStr = JSON.stringify(
                                    cert.rawData,
                                    null,
                                    2
                                  );
                                  const blob = new Blob([dataStr], {
                                    type: "application/json",
                                  });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement("a");
                                  a.href = url;
                                  a.download = `sertifikat-donor-${cert.id}.json`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                }}
                              >
                                <ShieldCheckIcon className="w-3 h-3" />
                                <span>JSON</span>
                              </button>
                            </div>

                            {/* View Detail Link */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewCertificateDetail(cert);
                              }}
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors hover:bg-blue-50 p-2 rounded-lg"
                            >
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
            )}
          </FadeIn>
        </div>
      </div>

      {/* Certificate Detail Modal */}
      {showDetailModal && selectedCertificate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeDetailModal}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detail Sertifikat
                </h2>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Certificate Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white">
                  <div className="flex items-center space-x-4">
                    <HeartIcon className="w-12 h-12 fill-current" />
                    <div>
                      <h3 className="text-2xl font-bold">
                        {selectedCertificate.type}
                      </h3>
                      <p className="text-red-100">
                        Digital Certificate - Blockchain Verified
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certificate Content */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedCertificate.name}
                    </h4>
                    <p className="text-gray-600">{selectedCertificate.role}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Golongan Darah</p>
                      <p className="text-xl font-bold text-red-600">
                        {selectedCertificate.bloodType}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Donasi</p>
                      <p className="text-xl font-bold text-gray-900">
                        {selectedCertificate.totalDonations}
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">
                      Blockchain Verification
                    </h5>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Blockchain ID:</p>
                        <p className="text-sm font-mono text-blue-600 break-all">
                          {selectedCertificate.blockchainId}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Certificate Number:
                        </p>
                        <p className="text-sm font-mono text-gray-800">
                          {selectedCertificate.certificateNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Status</h5>
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">
                        {selectedCertificate.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDownloadTarget(selectedCertificate);
                    }}
                    disabled={downloading}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400"
                  >
                    {downloading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Mengunduh...</span>
                      </>
                    ) : (
                      <>
                        <DownloadIcon className="w-4 h-4" />
                        <span>Download PNG</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const dataStr = JSON.stringify(
                        selectedCertificate.rawData,
                        null,
                        2
                      );
                      const blob = new Blob([dataStr], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `sertifikat-donor-${selectedCertificate.id}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>Download JSON</span>
                  </button>
                  <button
                    onClick={closeDetailModal}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Certificate Template for Download */}
      {downloadTarget && (
        <div
          ref={certificateRef}
          style={{
            position: "fixed",
            top: "-9999px",
            left: "0",
            width: "800px",
            height: "600px",
            
            backgroundColor: "white",
            padding: "0",
            fontFamily: "Arial, sans-serif",
            zIndex: -1,
            pointerEvents: "none",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "100%",
              position: "relative",
              padding: "0",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              backgroundImage: `url(${BackgroundSertifikat})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "40px", paddingTop: "40px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "40px",
              maxWidth: "800px",
              margin: "50px auto 0 auto",
              width: "100%",
              padding: "0 40px"
            }}>
              {/* Certificate Number */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    marginTop: "25px",
                    fontSize: "24px",
                    color: "#000000",
                    fontFamily: "Source Sans Pro, Arial, sans-serif",
                    fontWeight: 700,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                    letterSpacing: "1px",
                  }}
                >
                  {downloadTarget.certificateNumber}
                </div>
              </div>

              {/* Blockchain Section */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "16px",
                    color: "#000000",
                    fontFamily: "Source Sans Pro, Arial, sans-serif",
                    fontWeight: 600,
                    textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
                    wordBreak: "break-all",
                    maxWidth: "600px",
                    margin: "10px auto -10px auto",
                    lineHeight: "1.4",
                  }}
                >
                  {downloadTarget.blockchainId || "-"}
                </div>
              </div>

              {/* User Name */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontWeight: 700,
                    marginTop: "-10px",
                    // paddingTop: "20px",
                    fontSize: "37px",
                    color: "#e3342f",
                    fontFamily: "Bebas Neue, Arial, sans-serif",
                    textShadow: "2px 2px 4px rgba(255,255,255,0.9)",
                    letterSpacing: "1px",
                  }}
                >
                  {downloadTarget.name}
                </div>
              </div>

              {/* Donation Date */}
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    marginTop: "38px",
                    fontWeight: 700,
                    fontSize: "24px",
                    color: "#111827",
                    fontFamily: "Source Sans Pro, Arial, sans-serif",
                    textShadow: "1px 1px 2px rgba(255,255,255,0.9)",
                  }}
                >
                  {formatDate(downloadTarget.createdAt)}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                textAlign: "center",
                fontSize: "14px",
                color: "#6b7280",
                marginTop: "40px",
                paddingBottom: "40px",
                textShadow: "1px 1px 2px rgba(255,255,255,0.9)",
                fontWeight: 400,
              }}
            >
              {/* Sertifikat ini dikeluarkan oleh DarahConnect sebagai bukti kontribusi donor darah */}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default CertificatePage;
