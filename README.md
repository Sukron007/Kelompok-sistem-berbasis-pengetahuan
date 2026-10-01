# SIAKAD Pro - Portal Akademik Mahasiswa & Integrasi Pembayaran SPP Midtrans

SIAKAD Pro adalah aplikasi web Sistem Informasi Akademik (SIAKAD) terpadu dengan integrasi pembayaran tagihan SPP online secara otomatis melalui **Midtrans Snap Payment Gateway**.

Dibangun dengan arsitektur full-stack modern berprinsip **Separation of Concerns (Controller → Service → Repository → Prisma ORM → Relational Database)**, sistem ini dirancang siap produksi (*production-ready*) dengan autentikasi berbasis peran (RBAC), pencegahan *race-condition* pembayaran, penanganan webhook *idempotent*, pembuatan kwitansi sah otomatis, dan audit logging.

---

## 🚀 Fitur Utama

### 🎓 Portal Mahasiswa (Role: `MAHASISWA`)
- **Dashboard Akademik**: Ringkasan status SPP aktif, tugas yang harus dikumpulkan, jadwal kuliah hari ini, dan beban SKS.
- **Kartu Rencana Studi (KRS) & Akademik**: Informasi identitas mahasiswa, program studi, fakultas, dan daftar mata kuliah terdaftar.
- **Jadwal Kuliah Mingguan**: Jadwal tatap muka, nama dosen pengampu, ruang kelas, dan jam kuliah dengan filter hari.
- **Tugas Perkuliahan & Pengumpulan Berkas**: Unduh materi tugas, tenggat waktu (deadline), pengumpulan berkas tugas (PDF/DOCX/ZIP), status pengumpulan, serta penilaian & umpan balik dosen.
- **Portal Pembayaran SPP**:
  - Tampilan tagihan SPP semester aktif.
  - Pembayaran langsung melalui **Midtrans Snap Popup** (mendukung QRIS, GoPay, BCA/Mandiri/BRI Virtual Account, dll.).
  - Tombol simulasi webhook Sandbox untuk pengujian lokal.
  - Riwayat lengkap transaksi pembayaran.
- **Kwitansi Pembayaran Resmi**: Bukti pembayaran SPP sah dengan nomor kwitansi unik, stempel lunas, kode QR verifikasi, dan fitur cetak/simpan PDF (`window.print`).
- **Pusat Notifikasi**: Notifikasi penerbitan tagihan SPP, konfirmasi keberhasilan pembayaran, tugas baru, dan pengumuman kampus.
- **Profil Mahasiswa**: Pembaruan kontak (telepon, domisili) dan foto profil.

### 🛡️ Portal Administrator (Role: `ADMIN`)
- **Dashboard Analitik**: Metrik total mahasiswa, penerimaan SPP terkumpul, tagihan tertunggak, mata kuliah aktif, serta feed transaksi terbaru.
- **Manajemen Mahasiswa**: Pendaftaran mahasiswa baru, filter program studi, dan fitur **Penonaktifan/Arsip Aman (Anti-Delete)** untuk mahasiswa yang memiliki riwayat keuangan/SPP.
- **Manajemen Mata Kuliah**: Penambahan kurikulum, kode matkul, bobot SKS, dan capaian pembelajaran.
- **Manajemen Jadwal Kuliah**: Alokasi hari, ruang, waktu, kelas, dan dosen pengampu mata kuliah.
- **Penerbitan Tagihan SPP**: Pembuatan tagihan semester baru untuk mahasiswa dengan kontrol nominal terpusat di backend.
- **Monitoring Pembayaran**: Pemantauan status transaksi gateway real-time (*settlement, pending, expire, cancel*).
- **Siaran Notifikasi (Broadcast)**: Pengiriman pengumuman massal ke seluruh mahasiswa atau mahasiswa tertentu.
- **Log Audit Sistem**: Pelacakan riwayat aktivitas administratif dan transaksi sensitif.

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Axios, React Router v7.
- **Backend**: Node.js, Express.js, TypeScript, TSX runtime.
- **Database & ORM**: SQLite / PostgreSQL dengan Prisma ORM v6.
- **Payment Gateway**: Midtrans Snap & Core API (Node SDK), SHA-512 Signature Verification.
- **Keamanan & Autentikasi**: JSON Web Token (JWT), BCrypt password hashing, RBAC middleware, Zod schema validation, Multer file sanitization.
- **Testing**: End-to-End integration test suite (25 skenario uji).

---

## 📦 Kredensial Uji Coba (Seed Data)

Database telah disiapkan dengan akun bawaan untuk pengujian:

| Role | Email | Password | Keterangan |
|------|-------|----------|------------|
| **Mahasiswa** | `mahasiswa@siakad.ac.id` | `student123` | Budi Pratama (NIM: 202401001) - Tagihan SPP Rp2.500.000 |
| **Admin** | `admin@siakad.ac.id` | `admin123` | Administrator Akademik & Keuangan |

*Catatan: Pada halaman login terdapat tombol cepat (One-Click Quick Fill) untuk mempermudah pengujian.*

---

## ⚙️ Konfigurasi Environment (`.env`)

Salin berkas `.env.example` menjadi `.env`:

```env
# Server & Database
NODE_ENV=development
PORT=3000
DATABASE_URL="file:./prisma/dev.db"

# Autentikasi JWT
JWT_SECRET=super_secret_jwt_key_siakad_pro_2026_production
JWT_EXPIRES_IN=7d

# Midtrans Payment Gateway (Mode Sandbox)
# Dapatkan Server Key & Client Key dari: https://dashboard.sandbox.midtrans.com/ -> Settings -> Access Keys
MIDTRANS_SERVER_KEY=SB-Mid-server-YOUR_SANDBOX_SERVER_KEY
MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_SANDBOX_CLIENT_KEY
MIDTRANS_IS_PRODUCTION=false

# Client API URL
VITE_API_URL=/api
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-YOUR_SANDBOX_CLIENT_KEY
```

---

## 💳 Konfigurasi Midtrans Sandbox & Webhook

### 1. Registrasi Akun Midtrans Sandbox
1. Kunjungi [Midtrans Sandbox](https://dashboard.sandbox.midtrans.com) dan buat akun gratis.
2. Buka menu **Settings > Access Keys**.
3. Salin **Server Key** dan **Client Key**.
4. Masukkan ke berkas `.env` pada variabel `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY`.

### 2. Konfigurasi Webhook untuk Pengujian Lokal (ngrok)
Agar Midtrans Sandbox dapat mengirimkan notifikasi callback transaksi ke server lokal Anda:

1. Jalankan tunneling port 3000 menggunakan ngrok atau Cloudflare Tunnel:
   ```bash
   ngrok http 3000
   ```
2. Salin URL publik yang dihasilkan (contoh: `https://abcd-1234.ngrok-free.app`).
3. Buka Dashboard Midtrans Sandbox > **Settings > Configuration**.
4. Pada kolom **Payment Notification URL**, isi dengan:
   ```
   https://abcd-1234.ngrok-free.app/api/payments/midtrans/webhook
   ```
5. Simpan pengaturan.

### 3. Pengujian Webhook Tanpa Tunneling (Sandbox Simulation)
Sistem SIAKAD Pro dilengkapi dengan fitur simulasi webhook sandbox bawaan:
- Pada halaman **Pembayaran SPP**, jika tagihan berstatus `PENDING`, tersedia tombol **⚡ Simulasikan Webhook Settlement (Sandbox)**.
- Menekan tombol ini akan memicu alur webhook backend secara identik, memverifikasi status pembayaran, mengubah tagihan menjadi `PAID`, menerbitkan kwitansi bernomor unik, dan mengirimkan notifikasi ke mahasiswa.

---

## 📋 Langkah Menjalankan Aplikasi

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Migrasi Database & Seeding
```bash
# Sinkronkan skema Prisma ke database
npm run prisma:db-push

# Jalankan data awal (Mahasiswa, Admin, Mata Kuliah, Tagihan SPP)
npm run prisma:seed
```

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```
Aplikasi dapat diakses pada browser di: `http://localhost:3000`

### 4. Menjalankan Skrip Pengujian Terpadu
```bash
npm test # atau npx tsx tests/system.test.ts
```

### 5. Kompilasi & Build Produksi
```bash
npm run build
npm start
```

---

## 🔒 Keamanan & Integritas Finansial

1. **Authoritative Amount**: Nominal tagihan SPP selalu diambil langsung dari database (`bill.amount`), tidak pernah mempercayai nominal dari sisi frontend.
2. **Webhook Idempotency**: Penerimaan callback webhook yang berulang kali tidak akan menduplikasi kwitansi ataupun korup data transaksi.
3. **Audit Logging**: Peristiwa penting seperti login, pembuatan order pembayaran, pelunasan webhook, dan tindakan admin dicatat di tabel `audit_logs`.
4. **Perlindungan Riwayat Keuangan**: Mahasiswa yang sudah memiliki riwayat SPP/kwitansi dilindungi dari penghapusan permanen; sistem secara otomatis beralih ke status arsip/deaktivasi.
5. **Verifikasi Tanda Tangan**: Webhook Midtrans diverifikasi menggunakan enkripsi hash SHA-512 `(order_id + status_code + gross_amount + ServerKey)`.
