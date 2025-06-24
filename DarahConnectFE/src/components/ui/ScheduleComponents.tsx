import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, AlertCircle, CheckCircle, Plus, Filter, Search } from 'lucide-react';

interface DonationSchedule {
  id: string;
  date: string;
  time: string;
  location: string;
  hospital: string;
  capacity: number;
  registered: number;
  bloodTypesNeeded: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  requirements: string[];
}

interface ScheduleCalendarProps {
  schedules: DonationSchedule[];
  onScheduleSelect: (schedule: DonationSchedule) => void;
}

export const DonationScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ schedules, onScheduleSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getSchedulesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(schedule => schedule.date === dateStr);
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDateObj = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const daySchedules = getSchedulesForDate(currentDateObj);
      days.push({
        date: new Date(currentDateObj),
        isCurrentMonth: currentDateObj.getMonth() === month,
        schedules: daySchedules,
        isToday: currentDateObj.toDateString() === new Date().toDateString(),
        isSelected: selectedDate?.toDateString() === currentDateObj.toDateString()
      });
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Jadwal Donor Darah</h2>
            <p className="text-red-100">Temukan jadwal donor darah terdekat</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'month' ? 'bg-white text-red-600' : 'bg-red-500 text-white hover:bg-red-400'
              }`}
            >
              Bulan
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-white text-red-600' : 'bg-red-500 text-white hover:bg-red-400'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'month' && (
        <div className="p-6">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <h3 className="text-xl font-semibold text-gray-900">
              {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                onClick={() => setSelectedDate(day.date)}
                className={`p-2 min-h-[80px] border border-gray-100 cursor-pointer transition-colors relative ${
                  day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'
                } ${day.isToday ? 'ring-2 ring-red-500' : ''} ${
                  day.isSelected ? 'bg-blue-50 border-blue-300' : ''
                }`}
              >
                <div className="font-medium text-sm">{day.date.getDate()}</div>
                {day.schedules.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {day.schedules.slice(0, 2).map((schedule, idx) => (
                      <div
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          onScheduleSelect(schedule);
                        }}
                        className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full truncate hover:bg-red-200 transition-colors"
                      >
                        {schedule.time}
                      </div>
                    ))}
                    {day.schedules.length > 2 && (
                      <div className="text-xs text-gray-500">+{day.schedules.length - 2} lagi</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="mt-6 bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                Jadwal untuk {formatDate(selectedDate)}
              </h4>
              <div className="space-y-3">
                {getSchedulesForDate(selectedDate).map(schedule => (
                  <div
                    key={schedule.id}
                    onClick={() => onScheduleSelect(schedule)}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-red-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">{schedule.hospital}</h5>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{schedule.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{schedule.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{schedule.registered}/{schedule.capacity}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex space-x-1 mb-2">
                          {schedule.bloodTypesNeeded.map(type => (
                            <span key={type} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              {type}
                            </span>
                          ))}
                        </div>
                        <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                          Daftar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {getSchedulesForDate(selectedDate).length === 0 && (
                  <p className="text-gray-500 text-center py-4">Tidak ada jadwal donor untuk tanggal ini</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'list' && (
        <div className="p-6">
          <div className="space-y-4">
            {schedules.map(schedule => (
              <div
                key={schedule.id}
                onClick={() => onScheduleSelect(schedule)}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:border-red-300 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{schedule.hospital}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        schedule.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        schedule.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {schedule.status === 'upcoming' ? 'Mendatang' :
                         schedule.status === 'ongoing' ? 'Berlangsung' : 'Selesai'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(schedule.date).toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{schedule.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{schedule.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{schedule.registered}/{schedule.capacity} peserta</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center space-x-4">
                      <div className="flex space-x-1">
                        {schedule.bloodTypesNeeded.map(type => (
                          <span key={type} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {type}
                          </span>
                        ))}
                      </div>
                      <div className={`flex items-center space-x-1 text-xs ${
                        schedule.registered >= schedule.capacity ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {schedule.registered >= schedule.capacity ? (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            <span>Penuh</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Tersedia</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="ml-6">
                    <button 
                      disabled={schedule.registered >= schedule.capacity}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        schedule.registered >= schedule.capacity
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {schedule.registered >= schedule.capacity ? 'Penuh' : 'Daftar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Quick Schedule Widget
export const QuickScheduleWidget: React.FC<{ schedules: DonationSchedule[] }> = ({ schedules }) => {
  const upcomingSchedules = schedules
    .filter(s => s.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Jadwal Terdekat</h3>
        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
          Lihat Semua
        </button>
      </div>

      <div className="space-y-3">
        {upcomingSchedules.map(schedule => (
          <div key={schedule.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{schedule.hospital}</h4>
                <div className="flex items-center space-x-3 mt-1 text-sm text-gray-600">
                  <span>{new Date(schedule.date).toLocaleDateString('id-ID')}</span>
                  <span>{schedule.time}</span>
                </div>
              </div>
              <button className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors">
                Daftar
              </button>
            </div>
          </div>
        ))}

        {upcomingSchedules.length === 0 && (
          <p className="text-gray-500 text-center py-4">Belum ada jadwal mendatang</p>
        )}
      </div>
    </div>
  );
};

export default DonationScheduleCalendar; 