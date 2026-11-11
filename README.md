# StokKu — PWA Pengecekan Barang

Aplikasi inventaris berbasis **Progressive Web App (PWA)**. Bisa dipakai di laptop maupun HP, mendukung tampilan responsif, penyimpanan lokal, dan akses offline setelah aplikasi pertama kali dibuka.

## Fitur
- Dashboard ringkasan jenis barang, total unit, stok menipis, dan barang yang belum dicek hari ini.
- Tambah, edit, cari, filter, dan hapus data barang.
- Kode barang otomatis jika kolom kode dikosongkan.
- Kategori, lokasi penyimpanan, stok minimum, dan catatan.
- Pengecekan stok fisik, kondisi barang, selisih stok, dan catatan pemeriksaan.
- Riwayat penambahan, perubahan, penghapusan, dan pengecekan.
- Ekspor data barang ke CSV.
- PWA manifest, service worker, cache offline, dan desain responsif.

## Menjalankan di komputer dengan VS Code
1. Ekstrak ZIP ini.
2. Buka folder `pwa-pengecekan-barang` di VS Code.
3. Pasang ekstensi **Live Server** (opsional, untuk menjalankan lokal).
4. Klik kanan `index.html` → **Open with Live Server**.
5. Aplikasi terbuka di browser. Untuk menguji instalasi PWA/service worker, gunakan `localhost` melalui Live Server.

Alternatif tanpa ekstensi: buka terminal di folder proyek, lalu jalankan:
```bash
python3 -m http.server 5500
```
Buka `http://localhost:5500`.

## Push ke GitHub
Buat repository baru di GitHub (kosong), lalu jalankan terminal VS Code dari folder proyek:
```bash
git init
git add .
git commit -m "Initial commit - StokKu PWA"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPOSITORY.git
git push -u origin main
```
Ganti URL remote dengan URL repository milikmu.

## Deploy ke Vercel
1. Login ke https://vercel.com menggunakan akun GitHub.
2. Pilih **Add New → Project**.
3. Import repository GitHub yang baru dibuat.
4. Framework Preset pilih **Other**.
5. Build Command dan Output Directory dikosongkan (proyek statis).
6. Klik **Deploy**. Vercel akan memberikan domain `.vercel.app`.
7. Setiap `git push` ke branch `main` akan memicu deployment otomatis.

## Cara menggunakan
1. Buka menu **Data Barang**, tekan **Tambah Barang**.
2. Isi nama, kategori, jumlah stok, dan stok minimum. Kode barang boleh dikosongkan.
3. Buka menu **Pengecekan**, pilih barang dan masukkan jumlah stok fisik.
4. Pilih kondisi barang, isi catatan bila perlu, lalu simpan.
5. Lihat perubahan di Dashboard dan Riwayat Aktivitas.
6. Ekspor data barang melalui tombol **Ekspor CSV**.

## Penting: penyimpanan data
Versi ini menyimpan data di `localStorage` browser/perangkat yang digunakan. Artinya:
- Data tetap ada di browser yang sama setelah halaman ditutup.
- Data dapat digunakan offline setelah aplikasi berhasil dimuat dan tersimpan di cache.
- Data **belum tersinkron otomatis** antar perangkat atau antar pengguna.
- Menghapus data situs/browser dapat menghapus data inventaris. Ekspor CSV secara berkala sebagai cadangan.

Untuk penggunaan banyak pengguna, login, sinkronisasi cloud, dan database terpusat, aplikasi perlu ditingkatkan dengan backend (misalnya Supabase atau Firebase).
