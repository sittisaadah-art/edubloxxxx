import { BuildingData, AvatarOption, CanteenItem, OrnamentItem } from '../types/game';

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'raja', name: 'Raja Blox Ceria (Mahkota Emas)', emoji: '👑' },
  { id: 'neko', name: 'Neko Kucing Pink (Telinga Kucing)', emoji: '🐱' },
  { id: 'kapten', name: 'Kapten Bintang (Antena Kosmik)', emoji: '🚀' },
  { id: 'kesatria', name: 'Kesatria Zamrud (Topi Merah)', emoji: '🛡️' },
  { id: 'penyihir', name: 'Penyihir Pelangi (Topi Kerucut)', emoji: '🧙' },
  { id: 'noob', name: 'Noob Roblox Klasik', emoji: '🟩' },
];

export const INITIAL_BUILDINGS: Record<string, BuildingData> = {
  A: {
    code: 'A',
    title: 'Fungsi',
    icon: '🧠',
    color: 0xec4899,
    colorHex: '#ec4899',
    pos: { x: -70, z: -70 },
    questions: [
      {
        id: 'A1_1',
        submateri: 'A.1 Definisi Fungsi',
        q: 'Dalam konsep berpikir komputasional, apakah yang dimaksud dengan fungsi?',
        options: [
          'A. Pemetaan yang menghubungkan setiap elemen domain tepat ke satu elemen kodomain',
          'B. Pengulangan instruksi secara terus-menerus tanpa batas',
          'C. Proses membagi masalah besar menjadi bagian-bagian yang tidak berhubungan',
          'D. Perangkat keras untuk mempercepat komputasi matematika',
        ],
        key: 'A',
        explanation:
          'Fungsi dalam matematika dan komputasi adalah relasi khusus yang mengawankan setiap anggota himpunan asal (domain) tepat satu dengan anggota himpunan kawan (kodomain).',
      },
      {
        id: 'A1_2',
        submateri: 'A.1 Definisi Fungsi',
        q: 'Himpunan daerah asal dalam suatu fungsi matematika dinamakan ...',
        options: ['A. Kodomain', 'B. Domain', 'C. Range', 'D. Relasi'],
        key: 'B',
        explanation:
          'Domain adalah himpunan daerah asal, kodomain adalah daerah kawan, dan Range adalah himpunan daerah hasil pemetaan.',
      },
      {
        id: 'A2_1',
        submateri: 'A.2 Fungsi dalam Matematika',
        q: 'Jika fungsi f(x) = 2x + 3, maka hasil evaluasi fungsi untuk f(5) adalah ...',
        options: ['A. 10', 'B. 13', 'C. 15', 'D. 8'],
        key: 'B',
        explanation: 'f(5) = 2(5) + 3 = 10 + 3 = 13.',
      },
      {
        id: 'A2_2',
        submateri: 'A.2 Fungsi dalam Matematika',
        q: 'Fungsi g(x) = x² - 4. Jika nilai x = 3, maka nilai dari g(3) adalah ...',
        options: ['A. 5', 'B. 9', 'C. 13', 'D. 2'],
        key: 'A',
        explanation: 'g(3) = (3)² - 4 = 9 - 4 = 5.',
      },
      {
        id: 'A3_1',
        submateri: 'A.3 Fungsi dalam Komputasi',
        q: 'Manakah keuntungan utama dari penerapan fungsi (function / subroutine) dalam pemrograman komputer?',
        options: [
          'A. Membuat program menjadi lebih panjang dan rumit',
          'B. Kode dapat digunakan kembali (reusability) dan mempermudah modularisasi',
          'C. Menghilangkan kebutuhan memori dalam komputer',
          'D. Mempercepat koneksi internet pengguna',
        ],
        key: 'B',
        explanation:
          'Fungsi memungkinkan pemrogram menulis blok kode satu kali dan memanggilnya berulang kali (code reusability), serta membuat program terstruktur dan mudah di-debug.',
      },
      {
        id: 'A3_2',
        submateri: 'A.3 Fungsi dalam Komputasi',
        q: 'Nilai yang dikirimkan ke dalam sebuah fungsi saat dipanggil dinamakan ...',
        options: ['A. Argumen / Parameter', 'B. Output', 'C. Variable Global', 'D. Tipe Data'],
        key: 'A',
        explanation:
          'Nilai masukan yang diserahkan ke fungsi saat dipanggil diproses melalui parameter atau argumen fungsi.',
      },
      {
        id: 'A4_1',
        submateri: 'A.4 Dekomposisi Fungsi',
        q: 'Prinsip dekomposisi fungsi dalam berpikir komputasional dilakukan dengan cara ...',
        options: [
          'A. Menggabungkan semua kode program menjadi satu fungsi raksasa',
          'B. Memecah fungsi kompleks menjadi beberapa sub-fungsi yang lebih kecil dan fokus pada satu tugas spesifik',
          'C. Menghapus subprogram yang tidak terpakai secara acak',
          'D. Mengubah semua rumus matematika menjadi gambar grafis',
        ],
        key: 'B',
        explanation:
          'Dekomposisi fungsi memecah masalah besar menjadi tugas-tugas sub-fungsi mandiri yang lebih sederhana dan fokus.',
      },
    ],
  },
  B: {
    code: 'B',
    title: 'Konsep Himpunan Data Terstruktur',
    icon: '📊',
    color: 0xf59e0b,
    colorHex: '#f59e0b',
    pos: { x: 70, z: -70 },
    questions: [
      {
        id: 'B1_1',
        submateri: 'B.1 Pengertian Himpunan',
        q: 'Dalam ilmu matematika dan informatika, himpunan didefinisikan sebagai ...',
        options: [
          'A. Kumpulan objek atau elemen yang terdefinisi dengan jelas dan terukur',
          'B. Urutan data yang posisinya selalu berubah acak',
          'C. Angka-angka yang tidak memiliki hubungan satu sama lain',
          'D. Daftar instruksi logika percabangan tanpa syarat',
        ],
        key: 'A',
        explanation:
          'Himpunan adalah kumpulan objek-objek terdefinisi dengan jelas (well-defined) sehingga dapat dipastikan keanggotaannya.',
      },
      {
        id: 'B2_1',
        submateri: 'B.2 Notasi Himpunan',
        q: 'Simbol irisan (intersection) antara himpunan A dan himpunan B dilambangkan dengan ...',
        options: ['A. A ∪ B', 'B. A ∩ B', 'C. A ⊂ B', 'D. A \\ B'],
        key: 'B',
        explanation:
          'Irisan (intersection) dilambangkan dengan simbol ∩, sedangkan gabungan (union) dilambangkan dengan ∪.',
      },
      {
        id: 'B2_2',
        submateri: 'B.2 Notasi Himpunan',
        q: 'Jika A = {1, 2, 3, 4} dan B = {3, 4, 5, 6}, maka anggota dari A ∩ B adalah ...',
        options: ['A. {1, 2, 3, 4, 5, 6}', 'B. {3, 4}', 'C. {1, 2, 5, 6}', 'D. { }'],
        key: 'B',
        explanation:
          'Irisan (A ∩ B) terdiri dari anggota yang berada sekaligus di A dan B, yaitu angka 3 dan 4.',
      },
      {
        id: 'B3_1',
        submateri: 'B.3 Himpunan Data Terstruktur',
        q: 'Apakah yang dimaksud dengan data terstruktur?',
        options: [
          'A. Data acak berbentuk teks bebas tanpa format standar',
          'B. Data yang diorganisasikan dalam skema/format terdefinisi seperti tabel, baris, kolom, atau array',
          'C. Gambar dan rekaman suara mentah yang belum diolah',
          'D. Berkas arsip kompresi zip yang terenkripsi',
        ],
        key: 'B',
        explanation:
          'Data terstruktur memiliki format dan relasi yang konsisten (seperti tabel atau record) sehingga mudah diproses dan diindeks.',
      },
      {
        id: 'B4_1',
        submateri: 'B.4 Memecahkan Masalah Logika Himpunan',
        q: 'Diketahui 20 siswa menyukai Pemrograman, 15 siswa menyukai Robotik, dan 8 siswa menyukai keduanya. Berapakah total siswa yang menyukai minimal salah satu bidang tersebut?',
        options: ['A. 35 siswa', 'B. 27 siswa', 'C. 43 siswa', 'D. 12 siswa'],
        key: 'B',
        explanation:
          'n(A ∪ B) = n(A) + n(B) - n(A ∩ B) = 20 + 15 - 8 = 27 siswa.',
      },
    ],
  },
  C: {
    code: 'C',
    title: 'Sistem Bilangan',
    icon: '🔢',
    color: 0x10b981,
    colorHex: '#10b981',
    pos: { x: 70, z: 70 },
    questions: [
      {
        id: 'C1_1',
        submateri: 'C.1 Pengertian Sistem Bilangan',
        q: 'Sistem bilangan berbasis 2 yang menjadi bahasa dasar komputer (hanya terdiri dari digit 0 dan 1) disebut ...',
        options: ['A. Sistem Desimal', 'B. Sistem Biner', 'C. Sistem Oktal', 'D. Sistem Heksadesimal'],
        key: 'B',
        explanation:
          'Sistem bilangan biner (binary, base-2) merupakan fondasi utama rangkaian logika digital komputer.',
      },
      {
        id: 'C2_1',
        submateri: 'C.2 Jenis Sistem Bilangan',
        q: 'Sistem bilangan Heksadesimal menggunakan basis ... dan simbol angka serta huruf dari ...',
        options: [
          'A. Basis 8 (0 sampai 7)',
          'B. Basis 10 (0 sampai 9)',
          'C. Basis 16 (0-9 dan A-F)',
          'D. Basis 2 (0 dan 1)',
        ],
        key: 'C',
        explanation:
          'Heksadesimal menggunakan basis 16, dengan simbol 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, A(10), B(11), C(12), D(13), E(14), F(15).',
      },
      {
        id: 'C3_1',
        submateri: 'C.3 Konsep Aritmetika Modulo',
        q: 'Hasil dari operasi aritmetika 17 mod 5 (17 modulo 5) adalah ...',
        options: ['A. 3', 'B. 2', 'C. 5', 'D. 1'],
        key: 'B',
        explanation:
          '17 dibagi 5 hasilnya 3 dengan sisa 2. Modulo mencari sisa pembagian bulat, sehingga 17 mod 5 = 2.',
      },
      {
        id: 'C3_2',
        submateri: 'C.3 Konsep Aritmetika Modulo',
        q: 'Berapakah hasil dari 24 mod 7?',
        options: ['A. 3', 'B. 4', 'C. 2', 'D. 5'],
        key: 'A',
        explanation:
          '24 ÷ 7 = 3 sisa 3 (karena 7 × 3 = 21, dan 24 - 21 = 3).',
      },
      {
        id: 'C4_1',
        submateri: 'C.4 Konversi Sistem Bilangan',
        q: 'Nilai bilangan biner 1101₂ jika dikonversikan ke dalam bilangan desimal adalah ...',
        options: ['A. 11', 'B. 13', 'C. 15', 'D. 9'],
        key: 'B',
        explanation:
          '(1 × 2³) + (1 × 2²) + (0 × 2¹) + (1 × 2⁰) = 8 + 4 + 0 + 1 = 13₁₀.',
      },
      {
        id: 'C4_2',
        submateri: 'C.4 Konversi Sistem Bilangan',
        q: 'Konversikan bilangan desimal 10₁₀ ke dalam sistem bilangan biner!',
        options: ['A. 1010₂', 'B. 1100₂', 'C. 1001₂', 'D. 0101₂'],
        key: 'A',
        explanation:
          '10 ÷ 2 = 5 sisa 0; 5 ÷ 2 = 2 sisa 1; 2 ÷ 2 = 1 sisa 0; 1 ÷ 2 = 0 sisa 1. Dibaca dari sisa terakhir ke atas: 1010₂.',
      },
    ],
  },
  D: {
    code: 'D',
    title: 'Struktur Data Stack',
    icon: '📚',
    color: 0x8b5cf6,
    colorHex: '#8b5cf6',
    pos: { x: -70, z: 70 },
    questions: [
      {
        id: 'D1_1',
        submateri: 'D.1 Pengertian Stack',
        q: 'Prinsip utama kerja struktur data Stack (Tumpukan) adalah LIFO, yang merupakan singkatan dari ...',
        options: [
          'A. Last In, First Out',
          'B. Long In, Fast Out',
          'C. Logical Input, Fast Output',
          'D. List In, Final Out',
        ],
        key: 'A',
        explanation:
          'LIFO (Last In, First Out) berarti item yang paling akhir dimasukkan ke dalam tumpukan adalah yang pertama kali dikeluarkan.',
      },
      {
        id: 'D1_2',
        submateri: 'D.1 Operasi Stack',
        q: 'Operasi untuk menyisipkan atau menambahkan elemen baru ke bagian paling atas tumpukan (stack) dinamakan ...',
        options: ['A. Pop', 'B. Push', 'C. Peek', 'D. Clear'],
        key: 'B',
        explanation:
          'Push digunakan untuk memasukkan elemen baru ke atas stack, sedangkan Pop untuk mengambil elemen teratas.',
      },
      {
        id: 'D1_3',
        submateri: 'D.1 Operasi Stack',
        q: 'Operasi untuk mengambil atau menghapus elemen paling atas dari sebuah stack dinamakan ...',
        options: ['A. Push', 'B. Pop', 'C. Top', 'D. Enqueue'],
        key: 'B',
        explanation:
          'Pop mengeluarkan elemen teratas yang terakhir kali dimasukkan ke dalam stack.',
      },
      {
        id: 'D2_1',
        submateri: 'D.2 Penerapan Stack dalam Kehidupan Nyata',
        q: 'Manakah contoh aplikasi perangkat lunak sehari-hari yang menggunakan prinsip kerja Stack?',
        options: [
          'A. Antrean cetak printer (FIFO)',
          'B. Fitur Undo/Redo pada aplikasi pengolah kata dan browser back-button',
          'C. Pemutaran lagu berurutan',
          'D. Pengiriman pesan chat grup',
        ],
        key: 'B',
        explanation:
          'Fitur Undo mengingat aksi pengguna yang paling terakhir (Last In) untuk dibatalkan lebih dahulu (First Out).',
      },
      {
        id: 'D2_2',
        submateri: 'D.2 Simulasi Tracing Stack',
        q: 'Jika kita melakukan operasi PUSH(5), PUSH(8), PUSH(3) secara berurutan, maka angka yang keluar saat operasi POP() pertama kali adalah ...',
        options: ['A. 5', 'B. 8', 'C. 3', 'D. Tidak dapat ditentukan'],
        key: 'C',
        explanation:
          'Elemen 3 adalah elemen yang terakhir kali di-push (posisi paling atas / top), sehingga saat di-POP akan keluar terlebih dahulu.',
      },
    ],
  },
};

export const CANTEEN_ITEMS: CanteenItem[] = [
  { id: 'esteh', name: 'Es Teh Manis Blox', price: 10, xp: 20, emoji: '🥤', description: 'Minuman segar pelepas dahaga saat belajar algoritma.' },
  { id: 'bakso', name: 'Bakso Kuah Panas', price: 20, xp: 50, emoji: '🍜', description: 'Kuah kaldu hangat yang membakar semangat koding.' },
  { id: 'burger', name: 'Burger Cheesy Blox', price: 25, xp: 60, emoji: '🍔', description: 'Burger lezat penuh energi dengan keju lumer.' },
  { id: 'pizza', name: 'Pizza Keju Mozzarella', price: 30, xp: 80, emoji: '🍕', description: 'Sepotong pizza lezat untuk dibagi bersama skuad.' },
  { id: 'eskrim', name: 'Es Krim Pelangi', price: 15, xp: 35, emoji: '🍦', description: 'Es krim ceria tiga rasa penghilang stres kuis.' },
  { id: 'donat', name: 'Donat Cokelat Meseres', price: 12, xp: 25, emoji: '🍩', description: 'Manis renyah dengan taburan cokelat warna-warni.' },
];

export const ORNAMENT_CATALOG: OrnamentItem[] = [
  { id: 'gazebo', name: 'Gazebo Literasi', emoji: '⛩️', category: 'literasi' },
  { id: 'mading', name: 'Papan Mading Info', emoji: '📋', category: 'literasi' },
  { id: 'oak_tree', name: 'Pohon Rindang Asri', emoji: '🌳', category: 'flora' },
  { id: 'sakura_tree', name: 'Pohon Sakura Pink', emoji: '🌸', category: 'flora' },
  { id: 'flower_bed', name: 'Taman Bunga Pelangi', emoji: '🌷', category: 'flora' },
  { id: 'bench', name: 'Bangku Taman Santai', emoji: '🪑', category: 'dekorasi' },
  { id: 'picnic', name: 'Meja Piknik & Payung', emoji: '☂️', category: 'dekorasi' },
  { id: 'robot', name: 'Robot Maskot Blox', emoji: '🤖', category: 'kota' },
  { id: 'cat_statue', name: 'Monumen Kucing Oyen', emoji: '🐱', category: 'kota' },
  { id: 'fountain', name: 'Air Mancur Kota', emoji: '⛲', category: 'kota' },
  { id: 'icecream_cart', name: 'Gerobak Jajanan', emoji: '🍧', category: 'kota' },
];
