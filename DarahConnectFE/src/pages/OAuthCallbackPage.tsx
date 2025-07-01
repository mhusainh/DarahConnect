import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { decodeJWTToken, saveAuthData } from '../utils/jwt';
import { useApi } from '../hooks/useApi';

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { put } = useApi<any>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    gender: '',
    birth_date: '',
    blood_type: '',
    province: '',
    city: '',
  });

  // Ambil token dari query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (!token) {
      setError('Token tidak ditemukan');
      setLoading(false);
      return;
    }
    const decoded = decodeJWTToken(token);
    if (!decoded) {
      setError('Token tidak valid');
      setLoading(false);
      return;
    }
    setUserData(decoded);
    setIsNew(Boolean(decoded.is_new));
    setLoading(false);

    // Jika user lama, langsung login
    if (!decoded.is_new) {
      saveAuthData(token, decoded);
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      // User baru, isi form
      setForm({
        name: decoded.name || '',
        phone: '',
        gender: '',
        birth_date: '',
        blood_type: '',
        province: '',
        city: '',
      });
    }
  }, [location, navigate]);

  // Handle input form
  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Submit form user baru
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Kirim data ke backend (update profile)
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('phone', form.phone);
    formData.append('gender', form.gender);
    formData.append('birth_date', form.birth_date);
    formData.append('blood_type', form.blood_type);
    formData.append('province', form.province);
    formData.append('city', form.city);

    // Update profile endpoint (misal: /user/profile)
    const res = await put('/user/profile', formData);
    if (res.success) {
      // Simpan data login
      saveAuthData(localStorage.getItem('authToken')!, userData);
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.error || 'Gagal menyimpan data');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mr-3"></div>
        <span className="text-gray-600 text-base">Memproses login Google...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded">{error}</div>
      </div>
    );
  }

  if (isNew) {
    // Form user baru
    return (
      <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4">Lengkapi Data Pribadi</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Nama Lengkap</label>
            <input className="input" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1">Nomor HP</label>
            <input className="input" value={form.phone} onChange={e => handleChange('phone', e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1">Jenis Kelamin</label>
            <select className="input" value={form.gender} onChange={e => handleChange('gender', e.target.value)} required>
              <option value="">Pilih</option>
              <option value="Male">Laki-laki</option>
              <option value="Female">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Tanggal Lahir</label>
            <input className="input" type="date" value={form.birth_date} onChange={e => handleChange('birth_date', e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1">Golongan Darah</label>
            <select className="input" value={form.blood_type} onChange={e => handleChange('blood_type', e.target.value)} required>
              <option value="">Pilih</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Provinsi</label>
            <input className="input" value={form.province} onChange={e => handleChange('province', e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1">Kota</label>
            <input className="input" value={form.city} onChange={e => handleChange('city', e.target.value)} required />
          </div>
          <button type="submit" className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">Simpan & Lanjutkan</button>
        </form>
      </div>
    );
  }

  // User lama: loading sudah handle redirect
  return null;
};

export default OAuthCallbackPage;