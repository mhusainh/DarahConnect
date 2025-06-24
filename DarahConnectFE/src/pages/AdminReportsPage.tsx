import React, { useState } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Calendar, 
  Filter,
  Users,
  Heart,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Activity
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

const AdminReportsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  // Sample data for reports
  const overviewStats = {
    totalDonors: 1250,
    totalDonations: 3420,
    totalCampaigns: 89,
    totalCertificates: 2890,
    monthlyGrowth: {
      donors: 12.5,
      donations: 18.3,
      campaigns: 8.7,
      certificates: 15.2
    }
  };

  const donationsByMonth = [
    { month: 'Jan', donations: 280, donors: 95, campaigns: 8 },
    { month: 'Feb', donations: 320, donors: 108, campaigns: 12 },
    { month: 'Mar', donations: 290, donors: 102, campaigns: 7 },
    { month: 'Apr', donations: 380, donors: 125, campaigns: 15 },
    { month: 'May', donations: 420, donors: 142, campaigns: 18 },
    { month: 'Jun', donations: 390, donors: 135, campaigns: 14 }
  ];

  const bloodTypeDistribution = [
    { type: 'O+', count: 450, percentage: 36 },
    { type: 'A+', count: 380, percentage: 30 },
    { type: 'B+', count: 280, percentage: 22 },
    { type: 'AB+', count: 120, percentage: 10 },
    { type: 'O-', count: 15, percentage: 1.2 },
    { type: 'A-', count: 8, percentage: 0.6 },
    { type: 'B-', count: 3, percentage: 0.2 }
  ];

  const hospitalStats = [
    { name: 'RS Hasan Sadikin', donations: 450, campaigns: 25, success_rate: 95 },
    { name: 'RS Advent Bandung', donations: 380, campaigns: 18, success_rate: 92 },
    { name: 'RS Al Islam', donations: 320, campaigns: 15, success_rate: 88 },
    { name: 'RS Santo Borromeus', donations: 280, campaigns: 12, success_rate: 90 },
    { name: 'RS Hermina', donations: 220, campaigns: 10, success_rate: 87 }
  ];

  const certificateStats = {
    total: 2890,
    approved: 2650,
    pending: 180,
    rejected: 60,
    approvalRate: 91.7
  };

  const renderOverviewReport = () => (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Donor</p>
              <p className="text-2xl font-bold text-gray-900">{overviewStats.totalDonors.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+{overviewStats.monthlyGrowth.donors}% bulan ini</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Donasi</p>
              <p className="text-2xl font-bold text-gray-900">{overviewStats.totalDonations.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+{overviewStats.monthlyGrowth.donations}% bulan ini</p>
            </div>
            <Heart className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campaign</p>
              <p className="text-2xl font-bold text-gray-900">{overviewStats.totalCampaigns}</p>
              <p className="text-sm text-green-600 mt-1">+{overviewStats.monthlyGrowth.campaigns}% bulan ini</p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sertifikat</p>
              <p className="text-2xl font-bold text-gray-900">{overviewStats.totalCertificates.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+{overviewStats.monthlyGrowth.certificates}% bulan ini</p>
            </div>
            <Award className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Donations Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Donasi Bulanan</h3>
          <div className="space-y-4">
            {donationsByMonth.map((data, index) => (
              <div key={index} className="flex items-center">
                <div className="w-12 text-sm text-gray-600">{data.month}</div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-red-500 h-3 rounded-full"
                      style={{ width: `${(data.donations / 450) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-sm font-medium text-gray-900">{data.donations}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Blood Type Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribusi Golongan Darah</h3>
          <div className="space-y-3">
            {bloodTypeDistribution.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600">{data.type}</span>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">{data.count} donor</span>
                </div>
                <span className="text-sm text-gray-600">{data.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCertificateReport = () => (
    <div className="space-y-8">
      {/* Certificate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sertifikat</p>
              <p className="text-2xl font-bold text-gray-900">{certificateStats.total}</p>
            </div>
            <Award className="h-8 w-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disetujui</p>
              <p className="text-2xl font-bold text-gray-900">{certificateStats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Menunggu</p>
              <p className="text-2xl font-bold text-gray-900">{certificateStats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ditolak</p>
              <p className="text-2xl font-bold text-gray-900">{certificateStats.rejected}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Approval Rate */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Tingkat Persetujuan Sertifikat</h3>
        <div className="flex items-center">
          <div className="flex-1">
            <div className="bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${certificateStats.approvalRate}%` }}
              />
            </div>
          </div>
          <span className="ml-4 text-2xl font-bold text-green-600">{certificateStats.approvalRate}%</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {certificateStats.approved} dari {certificateStats.total} sertifikat disetujui
        </p>
      </div>
    </div>
  );

  const renderHospitalReport = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Statistik Rumah Sakit</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rumah Sakit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Donasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hospitalStats.map((hospital, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                      <div className="text-sm font-medium text-gray-900">{hospital.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{hospital.donations}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{hospital.campaigns}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{hospital.success_rate}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      hospital.success_rate >= 90 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {hospital.success_rate >= 90 ? 'Excellent' : 'Good'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout title="Laporan & Analytics" subtitle="Analisis data dan statistik platform">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Controls */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
              >
                <option value="overview">Overview</option>
                <option value="certificates">Sertifikat</option>
                <option value="hospitals">Rumah Sakit</option>
              </select>
              
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
              >
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="quarter">Kuartal Ini</option>
                <option value="year">Tahun Ini</option>
              </select>
            </div>
            
            <div className="flex space-x-4">
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export PDF</span>
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {selectedReport === 'overview' && renderOverviewReport()}
        {selectedReport === 'certificates' && renderCertificateReport()}
        {selectedReport === 'hospitals' && renderHospitalReport()}
      </div>
    </AdminLayout>
  );
};

export default AdminReportsPage; 