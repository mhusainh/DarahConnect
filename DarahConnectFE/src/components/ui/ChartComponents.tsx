import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { FadeIn } from './AnimatedComponents';

// Monthly Donation Chart
interface MonthlyDonationChartProps {
  data: Array<{
    month: string;
    donations: number;
    volunteers: number;
    bloodUnits: number;
  }>;
}

export const MonthlyDonationChart: React.FC<MonthlyDonationChartProps> = ({ data }) => {
  return (
    <FadeIn direction="up" delay={0.2}>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Statistik Donasi Bulanan</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="donations" 
              stroke="#dc2626" 
              strokeWidth={3}
              name="Jumlah Donasi"
            />
            <Line 
              type="monotone" 
              dataKey="volunteers" 
              stroke="#059669" 
              strokeWidth={3}
              name="Volunteer"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </FadeIn>
  );
};

// Blood Type Distribution Chart
interface BloodTypeChartProps {
  data: Array<{
    bloodType: string;
    count: number;
    percentage: number;
  }>;
}

export const BloodTypeChart: React.FC<BloodTypeChartProps> = ({ data }) => {
  const COLORS = ['#dc2626', '#059669', '#d97706', '#7c3aed', '#0891b2', '#be185d', '#047857', '#7c2d12'];

  return (
    <FadeIn direction="up" delay={0.4}>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Distribusi Golongan Darah</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ bloodType, percentage }) => `${bloodType} (${percentage}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </FadeIn>
  );
};

// Weekly Goals Progress Chart
interface WeeklyGoalsChartProps {
  data: Array<{
    week: string;
    target: number;
    achieved: number;
  }>;
}

export const WeeklyGoalsChart: React.FC<WeeklyGoalsChartProps> = ({ data }) => {
  return (
    <FadeIn direction="up" delay={0.6}>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Progress Target Mingguan</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="target" fill="#fca5a5" name="Target" />
            <Bar dataKey="achieved" fill="#dc2626" name="Tercapai" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </FadeIn>
  );
};

// Donation Trend Area Chart
interface DonationTrendChartProps {
  data: Array<{
    date: string;
    donations: number;
    emergencyRequests: number;
  }>;
}

export const DonationTrendChart: React.FC<DonationTrendChartProps> = ({ data }) => {
  return (
    <FadeIn direction="up" delay={0.8}>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Tren Donasi & Request Darurat</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="donations"
              stackId="1"
              stroke="#dc2626"
              fill="#dc2626"
              fillOpacity={0.6}
              name="Donasi"
            />
            <Area
              type="monotone"
              dataKey="emergencyRequests"
              stackId="1"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.6}
              name="Request Darurat"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </FadeIn>
  );
};

// Hospital Partnership Chart
interface HospitalChartProps {
  data: Array<{
    hospital: string;
    donations: number;
    rating: number;
  }>;
}

export const HospitalPartnershipChart: React.FC<HospitalChartProps> = ({ data }) => {
  return (
    <FadeIn direction="up" delay={1.0}>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Partnership Rumah Sakit</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="hospital" type="category" width={150} />
            <Tooltip />
            <Bar dataKey="donations" fill="#dc2626" name="Jumlah Donasi" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </FadeIn>
  );
}; 