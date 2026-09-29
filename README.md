# Tugas-1-Grafkom

# Panduan Modifikasi

> Catatan singkat untuk menemukan bagian yang biasanya diubah saat menyesuaikan bentuk dan tampilan scene. Nomor baris dapat bergeser jika kode diperbarui; gunakan nama bagian sebagai patokan utama.

## Peta bagian di `main.js`

| Bagian | Isi | Yang bisa dimodifikasi |
| --- | --- | --- |
| Sekitar baris 77 | Array `vertices` untuk seluruh bentuk | Koordinat dan bentuk geometri |
| Baris 139-181 | Transformasi objek, posisi padi, dan warna | Posisi, rotasi, skala, susunan padi, warna |
| Baris 289-380 | Fungsi gambar dan `drawScene` | Cara menggambar dan komposisi scene |

## 1. Geometri: sekitar baris 77

Geometri disimpan di `vertices` sebagai pasangan koordinat `(x, y)`. Ubah koordinat di bagian bentuk yang ingin disesuaikan. Nilai sekitar `-1` sampai `1` berada di dalam area tampilan WebGL; nilai di luar rentang ini bisa membuat titik keluar dari canvas.

Urutan vertex yang dipakai oleh scene saat ini:

| Indeks awal | Geometri | Jumlah vertex |
| ---: | --- | ---: |
| 0 | Segitiga | 3 |
| 3 | Kotak | 3 |
| 6 | Gunung kiri | 3 |
| 9 | Gunung kanan | 3 |
| 12 | Jalan | 3 |
| 15 | Padi | 3 |
| 18 | Bagian rumah pertama | 4 |
| 20 | Bagian rumah kedua | 4 |
| 24 | Atap segitiga | 3 |
| 25 | Garis atap | 4 |

Indeks di tabel adalah indeks vertex yang diberikan ke `gl.drawArrays`, bukan indeks angka di dalam `Float32Array`. Jika vertex ditambah, dihapus, atau dipindahkan urutannya, periksa juga indeks dan jumlah vertex pada pemanggilan fungsi gambar di `drawScene`. Untuk bentuk tertutup gunakan `drawRectacle` (`LINE_LOOP`); untuk garis gunakan `drawLine` (`LINE_STRIP`); untuk bidang segitiga gunakan `drawObject` (`TRIANGLES`).

## 2. Transformasi dan warna: baris 139-181

- `objectA`, `objectC`, dan `objectGunung` menyimpan posisi (`x`, `y`), rotasi (`rotation` dalam derajat), serta skala (`scaleX`, `scaleY`). Ubah nilainya untuk memindahkan, memutar, atau mengubah ukuran objek terkait.
- `objectsPadi` berisi daftar posisi padi. Tambahkan atau hapus item `{ x, y }` untuk mengubah jumlah dan susunannya.
- `colorA`, `colorB`, dan `colorC` menggunakan format RGBA dengan nilai kanal antara `0` dan `1`. Contoh: `[1, 0, 0, 1]` berarti merah tanpa transparansi.
- `transformOrder` memilih urutan transformasi yang digunakan oleh fungsi pembentuk matriks. Nilai awalnya `TRS`; fungsi pada `matrix3.js` mengubah rotasi dari derajat ke radian.

## 3. Fungsi gambar dan komposisi scene: baris 289-380

- `drawObject`, `drawRectacle`, dan `drawLine` mengirim matriks serta warna ke shader, lalu menggambar vertex mulai dari indeks yang diberikan.
- `createObjectBMatrix` menentukan animasi objek B. Ubah nilai `70.0` untuk kecepatan rotasi, `2.0` untuk tempo perubahan skala, dan `0.25` untuk besar perubahan skalanya.
- `drawScene` menentukan urutan objek yang digambar. Untuk menampilkan objek yang sudah disiapkan, aktifkan atau tambahkan pemanggilan fungsi gambar di sini. Parameter matriks mengatur transformasi; parameter indeks awal dan jumlah vertex harus sesuai dengan `vertices`.
- Event `keydown` dimulai di akhir rentang ini. Bagian tersebut menangani penekanan tombol, termasuk tombol sekali tekan untuk reset atau mengganti urutan transformasi.

## Pemeriksaan setelah mengubah

1. Pastikan setiap bentuk masih memakai indeks awal dan jumlah vertex yang benar.
2. Pastikan setiap pasangan koordinat tetap berurutan sebagai `x, y`.
3. Muat ulang halaman dan periksa apakah seluruh bentuk terlihat serta kontrol masih berfungsi.
