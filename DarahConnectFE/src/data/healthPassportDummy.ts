// Dummy data untuk Health Passport
export const healthPassportDummyData = {
  id: 1,
  userId: 12,
  bloodType: "A+",
  allergies: [
    "Penisilin",
    "Kacang tanah",
    "Seafood"
  ],
  medications: [
    "Vitamin D3 1000 IU",
    "Omega-3 Fish Oil",
    "Multivitamin"
  ],
  medicalConditions: [
    "Hipertensi ringan",
    "Asma ringan"
  ],
  emergencyContact: {
    name: "Siti Nurhaliza",
    phone: "08123456789",
    relation: "Istri"
  },
  vitalSigns: {
    bloodPressure: "120/80",
    heartRate: 72,
    temperature: 36.5,
    weight: 70,
    height: 175,
    bmi: 22.9,
    lastUpdated: "2024-01-15T08:30:00Z"
  },
  healthRecords: [
    {
      id: 1,
      type: "checkup" as const,
      title: "Medical Check-up Rutin",
      description: "Pemeriksaan kesehatan rutin tahunan. Semua parameter dalam batas normal.",
      date: "2024-01-10T09:00:00Z",
      doctor: "Dr. Ahmad Susanto, Sp.PD",
      hospital: "RS Advent Bandung",
      result: "Normal - Semua parameter dalam batas normal",
      status: "normal" as const,
      attachments: ["lab-results-2024-01.pdf", "chest-xray-2024-01.jpg"]
    },
    {
      id: 2,
      type: "medical" as const,
      title: "Skrining Hepatitis B & C",
      description: "Pemeriksaan skrining untuk Hepatitis B dan C sebelum donor darah.",
      date: "2023-12-15T10:30:00Z",
      doctor: "Dr. Maria Santoso, Sp.PK",
      hospital: "Lab Prodia Bandung",
      result: "Non-reaktif - Tidak terinfeksi Hepatitis B & C",
      status: "normal" as const
    },
    {
      id: 3,
      type: "donation" as const,
      title: "Donor Darah #15",
      description: "Donor darah rutin di PMI Kota Bandung. Volume 450ml.",
      date: "2023-11-20T14:00:00Z",
      doctor: "Petugas PMI",
      hospital: "PMI Kota Bandung",
      result: "Hb: 14.2 g/dL - Memenuhi syarat donor",
      status: "normal" as const
    },
    {
      id: 4,
      type: "vaccination" as const,
      title: "Vaksinasi COVID-19 Booster",
      description: "Vaksinasi booster COVID-19 dosis ke-4.",
      date: "2023-10-05T11:00:00Z",
      doctor: "Dr. Lisa Permata",
      hospital: "Puskesmas Cicendo",
      result: "Vaksinasi berhasil - Tidak ada efek samping",
      status: "normal" as const
    },
    {
      id: 5,
      type: "medical" as const,
      title: "Pemeriksaan Jantung",
      description: "EKG dan echocardiography untuk evaluasi kesehatan jantung.",
      date: "2023-09-12T13:30:00Z",
      doctor: "Dr. Budi Hartono, Sp.JP",
      hospital: "RS Advent Bandung",
      result: "EKG normal, fungsi jantung baik",
      status: "normal" as const
    }
  ],
  vaccinations: [
    {
      name: "COVID-19 (Pfizer)",
      date: "2023-10-05T11:00:00Z",
      nextDue: "2024-04-05T11:00:00Z",
      status: "completed" as const
    },
    {
      name: "Influenza",
      date: "2023-09-01T09:00:00Z",
      nextDue: "2024-09-01T09:00:00Z",
      status: "completed" as const
    },
    {
      name: "Hepatitis B",
      date: "2022-03-15T10:00:00Z",
      status: "completed" as const
    },
    {
      name: "Tetanus",
      date: "2021-06-20T14:00:00Z",
      nextDue: "2031-06-20T14:00:00Z",
      status: "completed" as const
    },
    {
      name: "Hepatitis A",
      date: "2024-02-10T00:00:00Z",
      status: "due" as const
    }
  ],
  donationHistory: [
    {
      id: 15,
      date: "2023-11-20T14:00:00Z",
      location: "PMI Kota Bandung",
      volume: 450,
      hemoglobin: 14.2,
      status: "completed" as const
    },
    {
      id: 14,
      date: "2023-09-15T15:30:00Z",
      location: "RS Advent Bandung",
      volume: 450,
      hemoglobin: 13.8,
      status: "completed" as const
    },
    {
      id: 13,
      date: "2023-07-10T10:00:00Z",
      location: "PMI Kota Bandung",
      volume: 450,
      hemoglobin: 14.5,
      status: "completed" as const
    },
    {
      id: 12,
      date: "2023-05-05T16:00:00Z",
      location: "Event Donor Darah ITB",
      volume: 450,
      hemoglobin: 13.9,
      status: "completed" as const
    },
    {
      id: 11,
      date: "2023-03-12T11:30:00Z",
      location: "PMI Kota Bandung",
      volume: 450,
      hemoglobin: 14.1,
      status: "completed" as const
    },
    {
      id: 10,
      date: "2023-01-20T13:00:00Z",
      location: "RS Advent Bandung",
      volume: 450,
      hemoglobin: 12.8,
      status: "deferred" as const // Ditolak karena Hb rendah
    },
    {
      id: 9,
      date: "2022-11-15T14:30:00Z",
      location: "PMI Kota Bandung",
      volume: 450,
      hemoglobin: 14.3,
      status: "completed" as const
    },
    {
      id: 8,
      date: "2022-09-10T09:00:00Z",
      location: "Event Donor Darah Unpad",
      volume: 450,
      hemoglobin: 13.7,
      status: "completed" as const
    }
  ]
};

// Mock API response
export const mockHealthPassportResponse = {
  success: true,
  data: healthPassportDummyData,
  message: "Health passport data retrieved successfully"
};

export default healthPassportDummyData; 