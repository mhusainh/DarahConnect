import React from 'react';
import { HeartIcon, UsersIcon, ShieldCheckIcon, PhoneIcon, MailIcon, MapPinIcon, CheckCircleIcon } from 'lucide-react';

const AboutPage: React.FC = () => {
  const stats = [
    { label: 'Donor Terdaftar', value: '50,000+' },
    { label: 'Nyawa Terselamatkan', value: '150,000+' },
    { label: 'Campaign Sukses', value: '2,500+' },
    { label: 'Kota Tercakup', value: '100+' }
  ];

  const features = [
    {
      icon: <HeartIcon className="h-8 w-8 text-primary-600" />,
      title: 'Mudah & Aman',
      description: 'Platform yang mudah digunakan dengan standar keamanan data tinggi untuk melindungi informasi pribadi Anda.'
    },
    {
      icon: <UsersIcon className="h-8 w-8 text-blue-600" />,
      title: 'Komunitas Peduli',
      description: 'Bergabung dengan ribuan donor yang telah berkomitmen membantu sesama dalam situasi darurat.'
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8 text-green-600" />,
      title: 'Terverifikasi',
      description: 'Semua campaign dan donor melalui proses verifikasi untuk memastikan keaslian dan keamanan.'
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Wijaya',
      role: 'Medical Director',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
      description: 'Dokter spesialis hematologi dengan pengalaman 15 tahun dalam transfusi darah.'
    },
    {
      name: 'Ahmad Fauzi',
      role: 'Community Manager',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
      description: 'Mengelola komunitas donor dan memastikan respons cepat untuk kebutuhan darurat.'
    },
    {
      name: 'Sari Dewi',
      role: 'Operations Lead',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80',
      description: 'Koordinator operasional yang memastikan efisiensi proses donor dan distribusi darah.'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Daftar Sebagai Donor',
      description: 'Buat akun dan lengkapi profil donor Anda dengan informasi kesehatan yang diperlukan.'
    },
    {
      step: '2',
      title: 'Cari atau Buat Campaign',
      description: 'Temukan campaign yang membutuhkan bantuan atau buat campaign baru untuk kebutuhan darurat.'
    },
    {
      step: '3',
      title: 'Konfirmasi Donasi',
      description: 'Pilih jadwal yang sesuai dan konfirmasi kehadiran untuk proses donor darah.'
    },
    {
      step: '4',
      title: 'Selamatkan Nyawa',
      description: 'Lakukan donor darah dan bantu menyelamatkan nyawa sesama yang membutuhkan.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Tentang DonorKita</h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto mb-8">
              Platform komunitas donor darah terdepan di Indonesia yang menghubungkan 
              para hero penyelamat nyawa dengan mereka yang membutuhkan bantuan.
            </p>
            <div className="flex justify-center">
              <HeartIcon className="h-16 w-16 text-primary-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Misi Kami</h2>
              <p className="text-lg text-gray-600 mb-6">
                DonorKita hadir untuk menyelesaikan tantangan ketersediaan darah di Indonesia. 
                Kami percaya bahwa teknologi dapat mempermudah proses donor darah dan 
                mempercepat respons terhadap kebutuhan darurat.
              </p>
              <p className="text-gray-600 mb-8">
                Melalui platform ini, kami memfasilitasi koneksi antara donor darah dengan 
                rumah sakit, organisasi kesehatan, dan individu yang membutuhkan. 
                Setiap tetes darah yang didonasikan dapat menyelamatkan hingga 3 nyawa.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Transparan & Terpercaya</h3>
                    <p className="text-gray-600">Semua proses dilakukan dengan transparansi penuh dan dapat dilacak.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Respons Cepat</h3>
                    <p className="text-gray-600">Sistem notifikasi real-time untuk situasi darurat.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Dukungan Medis</h3>
                    <p className="text-gray-600">Didukung oleh tenaga medis profesional dan berpengalaman.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                alt="Blood donation"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dampak yang Telah Kita Ciptakan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Bersama-sama, kita telah menciptakan dampak positif yang signifikan 
              dalam kehidupan ribuan orang di seluruh Indonesia.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Mengapa Memilih DonorKita?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Platform kami dirancang dengan teknologi terdepan dan standar keamanan 
              tinggi untuk memberikan pengalaman terbaik bagi para donor.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cara Kerja Platform</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Proses yang sederhana dan efisien untuk memulai perjalanan Anda 
              sebagai hero penyelamat nyawa.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tim Kami</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dipimpin oleh para profesional berpengalaman yang berkomitmen 
              untuk menciptakan dampak positif dalam dunia kesehatan.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Hubungi Kami</h2>
            <p className="text-primary-100 max-w-2xl mx-auto">
              Punya pertanyaan atau ingin berkolaborasi? Tim kami siap membantu Anda.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <PhoneIcon className="h-8 w-8 text-primary-200" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Telepon</h3>
              <p className="text-primary-100">+62 21 1234 5678</p>
              <p className="text-primary-100">24/7 Emergency Hotline</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <MailIcon className="h-8 w-8 text-primary-200" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-primary-100">info@donorkita.id</p>
              <p className="text-primary-100">support@donorkita.id</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <MapPinIcon className="h-8 w-8 text-primary-200" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Alamat</h3>
              <p className="text-primary-100">Jl. Sudirman No. 123</p>
              <p className="text-primary-100">Jakarta Pusat, 10220</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bergabunglah dengan Komunitas Hero
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Mulai perjalanan Anda sebagai hero penyelamat nyawa. 
            Setiap donasi Anda sangat berarti bagi yang membutuhkan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
              Daftar Sebagai Donor
            </button>
            <button className="border border-primary-600 text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
              Lihat Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 