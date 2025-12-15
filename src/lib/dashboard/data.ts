// Dummy data for the dashboard

export interface CrimeData {
  id: string;
  jenisKejadian: string;
  lokasi: string;
  tanggal: string;
  status: 'Selesai' | 'Proses' | 'Pending';
  tingkatBahaya: 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';
}

export interface CCTVData {
  id: string;
  lokasiCCTV: string;
  status: 'Aktif' | 'Nonaktif' | 'Maintenance';
  zona: string;
  terakhirDiperbarui: string;
}

export interface SecurityPostData {
  id: string;
  namaPos: string;
  lokasi: string;
  petugas: string;
  shift: 'Pagi' | 'Siang' | 'Malam';
  status: 'Aktif' | 'Nonaktif';
}

export interface UserData {
  id: string;
  nama: string;
  email: string;
  role: 'Admin' | 'Operator' | 'Viewer';
  status: 'Aktif' | 'Nonaktif' | 'Pending';
  tanggalBergabung: string;
}

export const crimeData: CrimeData[] = [
  { id: 'KRM001', jenisKejadian: 'Pencurian Kendaraan', lokasi: 'Jl. Sudirman No. 45, Jakarta Pusat', tanggal: '15/12/2024', status: 'Selesai', tingkatBahaya: 'Sedang' },
  { id: 'KRM002', jenisKejadian: 'Perampokan', lokasi: 'Jl. Thamrin, Jakarta Pusat', tanggal: '14/12/2024', status: 'Proses', tingkatBahaya: 'Tinggi' },
  { id: 'KRM003', jenisKejadian: 'Vandalisme', lokasi: 'Jl. Gatot Subroto, Jakarta Selatan', tanggal: '13/12/2024', status: 'Selesai', tingkatBahaya: 'Rendah' },
  { id: 'KRM004', jenisKejadian: 'Penipuan Online', lokasi: 'Jl. HR Rasuna Said, Kuningan', tanggal: '12/12/2024', status: 'Pending', tingkatBahaya: 'Sedang' },
  { id: 'KRM005', jenisKejadian: 'Pencurian Rumah', lokasi: 'Perumahan Menteng, Jakarta Pusat', tanggal: '11/12/2024', status: 'Proses', tingkatBahaya: 'Tinggi' },
  { id: 'KRM006', jenisKejadian: 'Penganiayaan', lokasi: 'Jl. Kebon Jeruk, Jakarta Barat', tanggal: '10/12/2024', status: 'Selesai', tingkatBahaya: 'Kritis' },
  { id: 'KRM007', jenisKejadian: 'Pencurian Motor', lokasi: 'Jl. Pramuka, Jakarta Timur', tanggal: '09/12/2024', status: 'Proses', tingkatBahaya: 'Sedang' },
  { id: 'KRM008', jenisKejadian: 'Penculikan', lokasi: 'Jl. Kemang Raya, Jakarta Selatan', tanggal: '08/12/2024', status: 'Proses', tingkatBahaya: 'Kritis' },
  { id: 'KRM009', jenisKejadian: 'Pencurian Toko', lokasi: 'Mall Central Park, Jakarta Barat', tanggal: '07/12/2024', status: 'Selesai', tingkatBahaya: 'Rendah' },
  { id: 'KRM010', jenisKejadian: 'Pemerasan', lokasi: 'Jl. Kuningan, Jakarta Selatan', tanggal: '06/12/2024', status: 'Pending', tingkatBahaya: 'Tinggi' },
  { id: 'KRM011', jenisKejadian: 'Perjudian', lokasi: 'Jl. Mangga Dua, Jakarta Utara', tanggal: '05/12/2024', status: 'Selesai', tingkatBahaya: 'Rendah' },
  { id: 'KRM012', jenisKejadian: 'Narkoba', lokasi: 'Jl. Pluit, Jakarta Utara', tanggal: '04/12/2024', status: 'Proses', tingkatBahaya: 'Kritis' },
];

export const cctvData: CCTVData[] = [
  { id: 'CCTV001', lokasiCCTV: 'Bundaran HI', status: 'Aktif', zona: 'Zona Pusat', terakhirDiperbarui: '15/12/2024 14:30' },
  { id: 'CCTV002', lokasiCCTV: 'Jl. Sudirman KM 5', status: 'Aktif', zona: 'Zona Pusat', terakhirDiperbarui: '15/12/2024 14:25' },
  { id: 'CCTV003', lokasiCCTV: 'Terminal Blok M', status: 'Maintenance', zona: 'Zona Selatan', terakhirDiperbarui: '14/12/2024 09:00' },
  { id: 'CCTV004', lokasiCCTV: 'Stasiun Gambir', status: 'Aktif', zona: 'Zona Pusat', terakhirDiperbarui: '15/12/2024 14:20' },
  { id: 'CCTV005', lokasiCCTV: 'Pasar Tanah Abang', status: 'Aktif', zona: 'Zona Pusat', terakhirDiperbarui: '15/12/2024 14:15' },
  { id: 'CCTV006', lokasiCCTV: 'Mall Taman Anggrek', status: 'Nonaktif', zona: 'Zona Barat', terakhirDiperbarui: '13/12/2024 16:00' },
  { id: 'CCTV007', lokasiCCTV: 'Pelabuhan Tanjung Priok', status: 'Aktif', zona: 'Zona Utara', terakhirDiperbarui: '15/12/2024 14:10' },
  { id: 'CCTV008', lokasiCCTV: 'Bandara Soekarno-Hatta T3', status: 'Aktif', zona: 'Zona Bandara', terakhirDiperbarui: '15/12/2024 14:00' },
  { id: 'CCTV009', lokasiCCTV: 'Jl. Casablanca', status: 'Maintenance', zona: 'Zona Selatan', terakhirDiperbarui: '12/12/2024 11:30' },
  { id: 'CCTV010', lokasiCCTV: 'Kemayoran Fair Ground', status: 'Aktif', zona: 'Zona Pusat', terakhirDiperbarui: '15/12/2024 13:55' },
  { id: 'CCTV011', lokasiCCTV: 'Jl. Raya Bekasi', status: 'Aktif', zona: 'Zona Timur', terakhirDiperbarui: '15/12/2024 13:50' },
  { id: 'CCTV012', lokasiCCTV: 'Senayan City', status: 'Aktif', zona: 'Zona Selatan', terakhirDiperbarui: '15/12/2024 13:45' },
  { id: 'CCTV013', lokasiCCTV: 'Monas', status: 'Aktif', zona: 'Zona Pusat', terakhirDiperbarui: '15/12/2024 13:40' },
  { id: 'CCTV014', lokasiCCTV: 'Ancol Beach', status: 'Nonaktif', zona: 'Zona Utara', terakhirDiperbarui: '10/12/2024 08:00' },
];

export const securityPostData: SecurityPostData[] = [
  { id: 'POS001', namaPos: 'Pos Bundaran HI', lokasi: 'Bundaran HI, Jakarta Pusat', petugas: 'Budi Santoso', shift: 'Pagi', status: 'Aktif' },
  { id: 'POS002', namaPos: 'Pos Sudirman', lokasi: 'Jl. Sudirman KM 10', petugas: 'Ahmad Wijaya', shift: 'Siang', status: 'Aktif' },
  { id: 'POS003', namaPos: 'Pos Blok M', lokasi: 'Terminal Blok M', petugas: 'Siti Rahayu', shift: 'Malam', status: 'Aktif' },
  { id: 'POS004', namaPos: 'Pos Gambir', lokasi: 'Stasiun Gambir', petugas: 'Dedi Kurniawan', shift: 'Pagi', status: 'Aktif' },
  { id: 'POS005', namaPos: 'Pos Tanah Abang', lokasi: 'Pasar Tanah Abang', petugas: 'Rina Melati', shift: 'Siang', status: 'Nonaktif' },
  { id: 'POS006', namaPos: 'Pos Taman Anggrek', lokasi: 'Mall Taman Anggrek', petugas: 'Hendra Saputra', shift: 'Malam', status: 'Aktif' },
  { id: 'POS007', namaPos: 'Pos Tanjung Priok', lokasi: 'Pelabuhan Tanjung Priok', petugas: 'Agus Pratama', shift: 'Pagi', status: 'Aktif' },
  { id: 'POS008', namaPos: 'Pos Bandara T1', lokasi: 'Bandara Soekarno-Hatta T1', petugas: 'Dewi Lestari', shift: 'Siang', status: 'Aktif' },
  { id: 'POS009', namaPos: 'Pos Kemayoran', lokasi: 'Kemayoran Fair Ground', petugas: 'Joko Widodo', shift: 'Malam', status: 'Aktif' },
  { id: 'POS010', namaPos: 'Pos Senayan', lokasi: 'GBK Senayan', petugas: 'Mega Putri', shift: 'Pagi', status: 'Nonaktif' },
  { id: 'POS011', namaPos: 'Pos Monas', lokasi: 'Tugu Monas', petugas: 'Andi Firmansyah', shift: 'Siang', status: 'Aktif' },
  { id: 'POS012', namaPos: 'Pos Ancol', lokasi: 'Pantai Ancol', petugas: 'Lisa Permata', shift: 'Malam', status: 'Aktif' },
];

export const userData: UserData[] = [
  { id: 'USR001', nama: 'Administrator Sistem', email: 'admin@security.go.id', role: 'Admin', status: 'Aktif', tanggalBergabung: '01/01/2023' },
  { id: 'USR002', nama: 'Budi Hartono', email: 'budi.hartono@security.go.id', role: 'Operator', status: 'Aktif', tanggalBergabung: '15/03/2023' },
  { id: 'USR003', nama: 'Siti Nurhaliza', email: 'siti.nur@security.go.id', role: 'Operator', status: 'Aktif', tanggalBergabung: '20/04/2023' },
  { id: 'USR004', nama: 'Ahmad Dahlan', email: 'ahmad.d@security.go.id', role: 'Viewer', status: 'Aktif', tanggalBergabung: '10/05/2023' },
  { id: 'USR005', nama: 'Dewi Sartika', email: 'dewi.s@security.go.id', role: 'Operator', status: 'Nonaktif', tanggalBergabung: '25/06/2023' },
  { id: 'USR006', nama: 'Raden Ajeng', email: 'raden.a@security.go.id', role: 'Admin', status: 'Aktif', tanggalBergabung: '01/07/2023' },
  { id: 'USR007', nama: 'Cut Nyak Dien', email: 'cut.nyak@security.go.id', role: 'Viewer', status: 'Pending', tanggalBergabung: '15/08/2023' },
  { id: 'USR008', nama: 'Imam Bonjol', email: 'imam.b@security.go.id', role: 'Operator', status: 'Aktif', tanggalBergabung: '01/09/2023' },
  { id: 'USR009', nama: 'Diponegoro', email: 'dipo@security.go.id', role: 'Viewer', status: 'Aktif', tanggalBergabung: '20/10/2023' },
  { id: 'USR010', nama: 'Kartini Putri', email: 'kartini.p@security.go.id', role: 'Operator', status: 'Aktif', tanggalBergabung: '05/11/2023' },
  { id: 'USR011', nama: 'Hasanuddin', email: 'hasan@security.go.id', role: 'Viewer', status: 'Pending', tanggalBergabung: '10/12/2023' },
  { id: 'USR012', nama: 'Sultan Agung', email: 'sultan.a@security.go.id', role: 'Admin', status: 'Aktif', tanggalBergabung: '01/01/2024' },
];
