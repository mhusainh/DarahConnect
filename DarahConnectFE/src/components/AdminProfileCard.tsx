import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Calendar, Camera, Edit3, Save, X } from 'lucide-react';
import { useApi } from '../hooks/useApi';

interface AdminProfileCardProps {
  compact?: boolean; // Jika true, tampilkan versi ringkas (untuk dropdown)
}

const AdminProfileCard: React.FC<AdminProfileCardProps> = ({ compact = false }) => {
  const { data: profileData, loading, error, get, put, post } = useApi<any>();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');

  useEffect(() => {
    get('/user/profile');
  }, [get]);

  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
      setEditedProfile(profileData);
    }
  }, [profileData]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Format birth_date ke YYYY-MM-DD
      let formattedBirthDate = '';
      if (editedProfile.birth_date) {
        if (editedProfile.birth_date.includes('T')) {
          formattedBirthDate = editedProfile.birth_date.split('T')[0];
        } else {
          formattedBirthDate = editedProfile.birth_date;
        }
      }
      const formData = new FormData();
      formData.append('name', editedProfile.name);
      formData.append('gender', editedProfile.gender);
      formData.append('phone', editedProfile.phone);
      formData.append('birth_date', formattedBirthDate);
      formData.append('address', editedProfile.address);
      // Email tidak bisa diedit (opsional, bisa dihilangkan jika backend support)
      // formData.append('email', editedProfile.email);
      const response = await put('/user/profile', formData);
      if (response.success) {
        setIsEditing(false);
        get('/user/profile');
      } else {
        alert(response.error || 'Gagal update profil');
      }
    } catch (e) {
      alert('Gagal update profil');
    }
    setSaving(false);
  };

  // === UPLOAD FOTO PROFIL ===
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setProfileImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
      // Auto upload
      const formData = new FormData();
      formData.append('image', file);
      const response = await post('/user/profile/picture', formData);
      if (response.success) {
        get('/user/profile');
        setProfileImage(null);
        setProfileImagePreview('');
      } else {
        alert(response.error || 'Gagal upload foto');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mr-3"></div>
        <span className="text-gray-600 text-base">Memuat profil admin...</span>
      </div>
    );
  }
  if (error || !profile) return <div>Gagal memuat profil admin</div>;

  return (
    <div className={compact ? 'flex items-center space-x-3' : 'bg-white rounded-xl shadow-sm border overflow-hidden'}>
      {/* Avatar */}
      <div className={compact ? '' : 'bg-gradient-to-r from-red-600 to-red-700 px-8 py-6'}>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              src={profileImagePreview || profile.url_file || '/api/placeholder/150/150'}
              alt={profile.name}
              className={compact ? 'w-10 h-10 rounded-full object-cover border-2 border-gray-200' : 'w-24 h-24 rounded-full border-4 border-white shadow-lg'}
            />
            {!compact && (
              <>
                <input
                  type="file"
                  id="profile-image-input"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="profile-image-input"
                  className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </label>
              </>
            )}
          </div>
          <div className={compact ? '' : 'text-white'}>
            <h1 className={compact ? 'text-base font-bold text-gray-900' : 'text-3xl font-bold'}>{profile.name}</h1>
            <p className={compact ? 'text-xs text-gray-500' : 'text-red-100 text-lg'}>{profile.role}</p>
            {!compact && (
              <div className="flex items-center mt-2 text-red-100 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Bergabung sejak {profile.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID') : '-'}</span>
              </div>
            )}
            {compact && <p className="text-xs text-gray-500">{profile.email}</p>}
          </div>
        </div>
      </div>
      {/* Detail info (non-compact) */}
      {!compact && (
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Informasi Profil</h3>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profil</span>
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Batal</span>
                </button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile?.name || ''}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">{profile.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <p className="text-gray-900">{profile.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedProfile?.phone || ''}
                  onChange={e => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{profile.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
              {isEditing ? (
                <select
                  value={editedProfile?.gender || 'Male'}
                  onChange={e => handleInputChange('gender', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                >
                  <option value="Male">Laki-laki</option>
                  <option value="Female">Perempuan</option>
                </select>
              ) : (
                <p className="text-gray-900">{profile.gender === 'Male' ? 'Laki-laki' : profile.gender === 'Female' ? 'Perempuan' : '-'}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile?.address || ''}
                  onChange={e => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300"
                />
              ) : (
                <p className="text-gray-900">{profile.address}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfileCard; 
