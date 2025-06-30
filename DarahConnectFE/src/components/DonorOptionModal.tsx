import React, { useState } from 'react';
import { X, HeartIcon, CalendarIcon, AlertTriangleIcon, CheckCircleIcon, ClockIcon } from 'lucide-react';
import { BloodCampaign } from '../types';

interface DonorOptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: BloodCampaign | null;
  onDonorNow: (notes: string, hospitalId: number, description: string) => Promise<void>;
  onScheduleOnly: (hospitalId: number, description: string) => Promise<void>;
}

const DonorOptionModal: React.FC<DonorOptionModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onDonorNow,
  onScheduleOnly
}) => {
  const [notes, setNotes] = useState("Saya bersedia mendonorkan darah untuk kegiatan ini");
  const [description, setDescription] = useState("Jadwal donor darah rutin");
  const [hospitalId] = useState(1); // Default hospital ID, bisa disesuaikan
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'donor' | 'schedule' | null>(null);

  if (!isOpen || !campaign) return null;

  const handleDonorNow = async () => {
    setIsSubmitting(true);
    try {
      await onDonorNow(notes, hospitalId, description);
      onClose();
    } catch (error) {
      console.error('Error during donor now registration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleOnly = async () => {
    setIsSubmitting(true);
    try {
      await onScheduleOnly(hospitalId, description);
      onClose();
    } catch (error) {
      console.error('Error during schedule creation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNotes("Saya bersedia mendonorkan darah untuk kegiatan ini");
      setDescription("Jadwal donor darah rutin");
      setSelectedOption(null);
      onClose();
    }
  };

  const handleOptionSelect = (option: 'donor' | 'schedule') => {
    setSelectedOption(option);
  };

  const handleConfirm = () => {
    if (selectedOption === 'donor') {
      handleDonorNow();
    } else if (selectedOption === 'schedule') {
      handleScheduleOnly();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <HeartIcon className="w-5 h-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pilihan Donor Darah
                </h3>
                <p className="text-sm text-gray-600">
                  {campaign.title}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Campaign Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Rumah Sakit</span>
                <span className="text-sm text-gray-600">{campaign.hospital}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Golongan Darah</span>
                <div className="flex gap-1">
                  {campaign.bloodType.map((type, index) => (
                    <span key={index} className="text-sm bg-primary-100 text-primary-800 px-2 py-1 rounded">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Tingkat Urgensi</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  campaign.urgencyLevel === 'critical' ? 'bg-red-100 text-red-800' :
                  campaign.urgencyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                  campaign.urgencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {campaign.urgencyLevel === 'critical' ? 'Sangat Mendesak' :
                   campaign.urgencyLevel === 'high' ? 'Mendesak' :
                   campaign.urgencyLevel === 'medium' ? 'Sedang' : 'Rendah'}
                </span>
              </div>
            </div>

            {/* Option Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Pilih Jenis Partisipasi</h4>
              <div className="space-y-3">
                {/* Donor Sekarang Option */}
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedOption === 'donor' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleOptionSelect('donor')}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedOption === 'donor' 
                          ? 'border-primary-500 bg-primary-500' 
                          : 'border-gray-300'
                      }`}>
                        {selectedOption === 'donor' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <HeartIcon className="w-5 h-5 text-red-500 mr-2" />
                        <h5 className="font-medium text-gray-900">Donor Sekarang</h5>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Daftar sebagai donor dan buat jadwal sekaligus. Anda akan terdaftar sebagai donor dan mendapat jadwal donor.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buat Schedule Option */}
                <div 
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedOption === 'schedule' 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleOptionSelect('schedule')}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedOption === 'schedule' 
                          ? 'border-primary-500 bg-primary-500' 
                          : 'border-gray-300'
                      }`}>
                        {selectedOption === 'schedule' && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="flex items-center">
                        <CalendarIcon className="w-5 h-5 text-blue-500 mr-2" />
                        <h5 className="font-medium text-gray-900">Buat Schedule</h5>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Hanya membuat jadwal donor tanpa mendaftar sebagai donor terlebih dahulu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi Jadwal
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Masukkan deskripsi jadwal..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                disabled={isSubmitting}
              />
            </div>

            {/* Notes Input - Only show for Donor Sekarang */}
            {selectedOption === 'donor' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Donor (Opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tambahkan catatan untuk pendaftaran donor Anda..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            )}

            {/* Important Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    Penting untuk Diketahui
                  </p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Pastikan Anda dalam kondisi sehat</li>
                    <li>• Usia minimal 17 tahun, berat badan minimal 45kg</li>
                    <li>• Tidak sedang mengonsumsi obat-obatan tertentu</li>
                    <li>• Jarak donor minimal 3 bulan dari donor terakhir</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting || !selectedOption}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {selectedOption === 'donor' ? 'Mendaftar...' : 'Membuat Jadwal...'}
                  </>
                ) : (
                  <>
                    {selectedOption === 'donor' ? (
                      <>
                        <HeartIcon className="w-4 h-4 mr-2" />
                        Donor Sekarang
                      </>
                    ) : selectedOption === 'schedule' ? (
                      <>
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Buat Schedule
                      </>
                    ) : (
                      'Pilih Opsi'
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorOptionModal;