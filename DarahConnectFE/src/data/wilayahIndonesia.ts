export interface Provinsi {
  id: string;
  nama: string;
}

export interface Kota {
  id: string;
  nama: string;
  provinsiId: string;
}

export const provinsiData: Provinsi[] = [
  { id: 'aceh', nama: 'Aceh' },
  { id: 'sumut', nama: 'Sumatera Utara' },
  { id: 'sumbar', nama: 'Sumatera Barat' },
  { id: 'riau', nama: 'Riau' },
  { id: 'jambi', nama: 'Jambi' },
  { id: 'sumsel', nama: 'Sumatera Selatan' },
  { id: 'bengkulu', nama: 'Bengkulu' },
  { id: 'lampung', nama: 'Lampung' },
  { id: 'babel', nama: 'Kepulauan Bangka Belitung' },
  { id: 'kepri', nama: 'Kepulauan Riau' },
  { id: 'jakarta', nama: 'DKI Jakarta' },
  { id: 'jabar', nama: 'Jawa Barat' },
  { id: 'jateng', nama: 'Jawa Tengah' },
  { id: 'yogya', nama: 'DI Yogyakarta' },
  { id: 'jatim', nama: 'Jawa Timur' },
  { id: 'banten', nama: 'Banten' },
  { id: 'bali', nama: 'Bali' },
  { id: 'ntb', nama: 'Nusa Tenggara Barat' },
  { id: 'ntt', nama: 'Nusa Tenggara Timur' },
  { id: 'kalbar', nama: 'Kalimantan Barat' },
  { id: 'kalteng', nama: 'Kalimantan Tengah' },
  { id: 'kalsel', nama: 'Kalimantan Selatan' },
  { id: 'kaltim', nama: 'Kalimantan Timur' },
  { id: 'kalut', nama: 'Kalimantan Utara' },
  { id: 'sulut', nama: 'Sulawesi Utara' },
  { id: 'sulteng', nama: 'Sulawesi Tengah' },
  { id: 'sulsel', nama: 'Sulawesi Selatan' },
  { id: 'sultra', nama: 'Sulawesi Tenggara' },
  { id: 'gorontalo', nama: 'Gorontalo' },
  { id: 'sulbar', nama: 'Sulawesi Barat' },
  { id: 'maluku', nama: 'Maluku' },
  { id: 'malut', nama: 'Maluku Utara' },
  { id: 'papua', nama: 'Papua' },
  { id: 'papbar', nama: 'Papua Barat' },
];

export const kotaData: Kota[] = [
  // DKI Jakarta
  { id: 'jak-pusat', nama: 'Jakarta Pusat', provinsiId: 'jakarta' },
  { id: 'jak-utara', nama: 'Jakarta Utara', provinsiId: 'jakarta' },
  { id: 'jak-barat', nama: 'Jakarta Barat', provinsiId: 'jakarta' },
  { id: 'jak-selatan', nama: 'Jakarta Selatan', provinsiId: 'jakarta' },
  { id: 'jak-timur', nama: 'Jakarta Timur', provinsiId: 'jakarta' },
  { id: 'kepulauan-seribu', nama: 'Kepulauan Seribu', provinsiId: 'jakarta' },

  // Jawa Barat
  { id: 'bandung', nama: 'Kota Bandung', provinsiId: 'jabar' },
  { id: 'bekasi', nama: 'Kota Bekasi', provinsiId: 'jabar' },
  { id: 'bogor', nama: 'Kota Bogor', provinsiId: 'jabar' },
  { id: 'cimahi', nama: 'Kota Cimahi', provinsiId: 'jabar' },
  { id: 'cirebon', nama: 'Kota Cirebon', provinsiId: 'jabar' },
  { id: 'depok', nama: 'Kota Depok', provinsiId: 'jabar' },
  { id: 'sukabumi', nama: 'Kota Sukabumi', provinsiId: 'jabar' },
  { id: 'tasikmalaya', nama: 'Kota Tasikmalaya', provinsiId: 'jabar' },
  { id: 'banjar', nama: 'Kota Banjar', provinsiId: 'jabar' },
  { id: 'bandung-barat', nama: 'Kabupaten Bandung Barat', provinsiId: 'jabar' },
  { id: 'karawang', nama: 'Kabupaten Karawang', provinsiId: 'jabar' },
  { id: 'purwakarta', nama: 'Kabupaten Purwakarta', provinsiId: 'jabar' },
  { id: 'subang', nama: 'Kabupaten Subang', provinsiId: 'jabar' },

  // Jawa Tengah
  { id: 'semarang', nama: 'Kota Semarang', provinsiId: 'jateng' },
  { id: 'surakarta', nama: 'Kota Surakarta', provinsiId: 'jateng' },
  { id: 'salatiga', nama: 'Kota Salatiga', provinsiId: 'jateng' },
  { id: 'magelang', nama: 'Kota Magelang', provinsiId: 'jateng' },
  { id: 'pekalongan', nama: 'Kota Pekalongan', provinsiId: 'jateng' },
  { id: 'tegal', nama: 'Kota Tegal', provinsiId: 'jateng' },
  { id: 'kudus', nama: 'Kabupaten Kudus', provinsiId: 'jateng' },
  { id: 'jepara', nama: 'Kabupaten Jepara', provinsiId: 'jateng' },
  { id: 'demak', nama: 'Kabupaten Demak', provinsiId: 'jateng' },

  // Jawa Timur
  { id: 'surabaya', nama: 'Kota Surabaya', provinsiId: 'jatim' },
  { id: 'malang', nama: 'Kota Malang', provinsiId: 'jatim' },
  { id: 'kediri', nama: 'Kota Kediri', provinsiId: 'jatim' },
  { id: 'blitar', nama: 'Kota Blitar', provinsiId: 'jatim' },
  { id: 'mojokerto', nama: 'Kota Mojokerto', provinsiId: 'jatim' },
  { id: 'madiun', nama: 'Kota Madiun', provinsiId: 'jatim' },
  { id: 'pasuruan', nama: 'Kota Pasuruan', provinsiId: 'jatim' },
  { id: 'probolinggo', nama: 'Kota Probolinggo', provinsiId: 'jatim' },
  { id: 'batu', nama: 'Kota Batu', provinsiId: 'jatim' },

  // Banten
  { id: 'serang', nama: 'Kota Serang', provinsiId: 'banten' },
  { id: 'tangerang', nama: 'Kota Tangerang', provinsiId: 'banten' },
  { id: 'tangerang-selatan', nama: 'Kota Tangerang Selatan', provinsiId: 'banten' },
  { id: 'cilegon', nama: 'Kota Cilegon', provinsiId: 'banten' },
  { id: 'lebak', nama: 'Kabupaten Lebak', provinsiId: 'banten' },
  { id: 'pandeglang', nama: 'Kabupaten Pandeglang', provinsiId: 'banten' },

  // DI Yogyakarta
  { id: 'yogyakarta', nama: 'Kota Yogyakarta', provinsiId: 'yogya' },
  { id: 'bantul', nama: 'Kabupaten Bantul', provinsiId: 'yogya' },
  { id: 'sleman', nama: 'Kabupaten Sleman', provinsiId: 'yogya' },
  { id: 'gunungkidul', nama: 'Kabupaten Gunungkidul', provinsiId: 'yogya' },
  { id: 'kulonprogo', nama: 'Kabupaten Kulon Progo', provinsiId: 'yogya' },

  // Sumatera Utara
  { id: 'medan', nama: 'Kota Medan', provinsiId: 'sumut' },
  { id: 'binjai', nama: 'Kota Binjai', provinsiId: 'sumut' },
  { id: 'tebing-tinggi', nama: 'Kota Tebing Tinggi', provinsiId: 'sumut' },
  { id: 'pematang-siantar', nama: 'Kota Pematang Siantar', provinsiId: 'sumut' },
  { id: 'tanjung-balai', nama: 'Kota Tanjung Balai', provinsiId: 'sumut' },
  { id: 'sibolga', nama: 'Kota Sibolga', provinsiId: 'sumut' },
  { id: 'padang-sidempuan', nama: 'Kota Padang Sidempuan', provinsiId: 'sumut' },
  { id: 'gunungsitoli', nama: 'Kota Gunungsitoli', provinsiId: 'sumut' },

  // Sumatera Barat
  { id: 'padang', nama: 'Kota Padang', provinsiId: 'sumbar' },
  { id: 'bukittinggi', nama: 'Kota Bukittinggi', provinsiId: 'sumbar' },
  { id: 'padangpanjang', nama: 'Kota Padangpanjang', provinsiId: 'sumbar' },
  { id: 'payakumbuh', nama: 'Kota Payakumbuh', provinsiId: 'sumbar' },
  { id: 'sawahlunto', nama: 'Kota Sawahlunto', provinsiId: 'sumbar' },
  { id: 'solok', nama: 'Kota Solok', provinsiId: 'sumbar' },
  { id: 'pariaman', nama: 'Kota Pariaman', provinsiId: 'sumbar' },

  // Riau
  { id: 'pekanbaru', nama: 'Kota Pekanbaru', provinsiId: 'riau' },
  { id: 'dumai', nama: 'Kota Dumai', provinsiId: 'riau' },
  { id: 'pelalawan', nama: 'Kabupaten Pelalawan', provinsiId: 'riau' },
  { id: 'kampar', nama: 'Kabupaten Kampar', provinsiId: 'riau' },
  { id: 'rokan-hulu', nama: 'Kabupaten Rokan Hulu', provinsiId: 'riau' },

  // Kepulauan Riau
  { id: 'batam', nama: 'Kota Batam', provinsiId: 'kepri' },
  { id: 'tanjungpinang', nama: 'Kota Tanjungpinang', provinsiId: 'kepri' },
  { id: 'bintan', nama: 'Kabupaten Bintan', provinsiId: 'kepri' },
  { id: 'karimun', nama: 'Kabupaten Karimun', provinsiId: 'kepri' },
  { id: 'lingga', nama: 'Kabupaten Lingga', provinsiId: 'kepri' },
  { id: 'natuna', nama: 'Kabupaten Natuna', provinsiId: 'kepri' },
  { id: 'anambas', nama: 'Kabupaten Kepulauan Anambas', provinsiId: 'kepri' },

  // Aceh
  { id: 'banda-aceh', nama: 'Kota Banda Aceh', provinsiId: 'aceh' },
  { id: 'langsa', nama: 'Kota Langsa', provinsiId: 'aceh' },
  { id: 'lhokseumawe', nama: 'Kota Lhokseumawe', provinsiId: 'aceh' },
  { id: 'sabang', nama: 'Kota Sabang', provinsiId: 'aceh' },
  { id: 'subulussalam', nama: 'Kota Subulussalam', provinsiId: 'aceh' },

  // Jambi
  { id: 'jambi-kota', nama: 'Kota Jambi', provinsiId: 'jambi' },
  { id: 'sungai-penuh', nama: 'Kota Sungai Penuh', provinsiId: 'jambi' },
  { id: 'batanghari', nama: 'Kabupaten Batanghari', provinsiId: 'jambi' },
  { id: 'bungo', nama: 'Kabupaten Bungo', provinsiId: 'jambi' },

  // Sumatera Selatan
  { id: 'palembang', nama: 'Kota Palembang', provinsiId: 'sumsel' },
  { id: 'prabumulih', nama: 'Kota Prabumulih', provinsiId: 'sumsel' },
  { id: 'pagar-alam', nama: 'Kota Pagar Alam', provinsiId: 'sumsel' },
  { id: 'lubuklinggau', nama: 'Kota Lubuklinggau', provinsiId: 'sumsel' },

  // Bengkulu
  { id: 'bengkulu-kota', nama: 'Kota Bengkulu', provinsiId: 'bengkulu' },
  { id: 'bengkulu-utara', nama: 'Kabupaten Bengkulu Utara', provinsiId: 'bengkulu' },
  { id: 'bengkulu-tengah', nama: 'Kabupaten Bengkulu Tengah', provinsiId: 'bengkulu' },

  // Lampung
  { id: 'bandar-lampung', nama: 'Kota Bandar Lampung', provinsiId: 'lampung' },
  { id: 'metro', nama: 'Kota Metro', provinsiId: 'lampung' },
  { id: 'lampung-tengah', nama: 'Kabupaten Lampung Tengah', provinsiId: 'lampung' },
  { id: 'lampung-selatan', nama: 'Kabupaten Lampung Selatan', provinsiId: 'lampung' },

  // Bangka Belitung
  { id: 'pangkalpinang', nama: 'Kota Pangkalpinang', provinsiId: 'babel' },
  { id: 'bangka', nama: 'Kabupaten Bangka', provinsiId: 'babel' },
  { id: 'belitung', nama: 'Kabupaten Belitung', provinsiId: 'babel' },
  { id: 'bangka-tengah', nama: 'Kabupaten Bangka Tengah', provinsiId: 'babel' },

  // Bali
  { id: 'denpasar', nama: 'Kota Denpasar', provinsiId: 'bali' },
  { id: 'badung', nama: 'Kabupaten Badung', provinsiId: 'bali' },
  { id: 'gianyar', nama: 'Kabupaten Gianyar', provinsiId: 'bali' },
  { id: 'tabanan', nama: 'Kabupaten Tabanan', provinsiId: 'bali' },
  { id: 'buleleng', nama: 'Kabupaten Buleleng', provinsiId: 'bali' },
  { id: 'karangasem', nama: 'Kabupaten Karangasem', provinsiId: 'bali' },
  { id: 'klungkung', nama: 'Kabupaten Klungkung', provinsiId: 'bali' },
  { id: 'bangli', nama: 'Kabupaten Bangli', provinsiId: 'bali' },
];

export const getKotaByProvinsi = (provinsiId: string): Kota[] => {
  return kotaData.filter(kota => kota.provinsiId === provinsiId);
};

export const getProvinsiById = (id: string): Provinsi | undefined => {
  return provinsiData.find(provinsi => provinsi.id === id);
};

export const getKotaById = (id: string): Kota | undefined => {
  return kotaData.find(kota => kota.id === id);
}; 