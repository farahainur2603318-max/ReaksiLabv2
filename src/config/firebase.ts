/**
 * config/firebase.ts
 * Inisialisasi dan Layanan Firebase untuk ReaksiLab XI.
 *
 * Menggunakan Firebase SDK resmi dengan kredensial dari .env (Vite).
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import type { UserProfile } from '../types';

// Membersihkan nilai env dari kemungkinan tanda kutip
const cleanEnv = (val?: string): string => {
  if (!val) return '';
  return val.replace(/^["']|["']$/g, '').trim();
};

export const firebaseConfig = {
  apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: cleanEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
};

// Inisialisasi Firebase App (Cegah inisialisasi ganda)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Provider Autentikasi Google
export const googleProvider = new GoogleAuthProvider();
// Memaksa Google menampilkan pemilih akun (select account) agar pengguna bisa memilih akun yang diinginkan
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Mengubah objek User Firebase menjadi UserProfile ReaksiLab
 */
export const formatFirebaseUser = (user: User, role: 'siswa' | 'guru' = 'siswa', method: 'google' | 'email' = 'email'): UserProfile => {
  const isGoogle = method === 'google' || user.providerData.some((p) => p.providerId === 'google.com');
  return {
    uid: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Pengguna ReaksiLab',
    email: user.email || '',
    role: role,
    avatar: isGoogle ? '🧪' : role === 'guru' ? '👨‍🏫' : '🧑‍🔬',
    photoURL: user.photoURL || undefined,
    isLoggedIn: true,
    loginMethod: isGoogle ? 'google' : 'email',
  };
};

/**
 * Menerjemahkan kode error Firebase Auth ke pesan Bahasa Indonesia yang ramah
 */
export const getFirebaseAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Email atau kata sandi yang Anda masukkan salah. Silakan periksa kembali.';
    case 'auth/user-not-found':
      return 'Akun dengan email ini belum terdaftar. Silakan daftar terlebih dahulu.';
    case 'auth/email-already-in-use':
      return 'Alamat email ini sudah terdaftar. Silakan masuk atau gunakan email lain.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu lemah. Gunakan minimal 6 karakter kombinasi huruf dan angka.';
    case 'auth/invalid-email':
      return 'Format alamat email tidak valid.';
    case 'auth/popup-closed-by-user':
      return 'Jendela login Google ditutup sebelum proses selesai. Silakan coba lagi.';
    case 'auth/popup-blocked':
      return 'Jendela pop-up login Google diblokir oleh peramban (browser). Harap izinkan pop-up untuk situs ini.';
    case 'auth/unauthorized-domain':
      return 'Domain ini belum diizinkan di Firebase Console. Pastikan "localhost" sudah terdaftar di menu Authentication -> Settings -> Authorized domains.';
    case 'auth/operation-not-allowed':
      return 'Metode login ini belum diaktifkan di Firebase Console. Harap aktifkan Google / Email di menu Authentication -> Sign-in method.';
    case 'auth/network-request-failed':
      return 'Gagal terhubung ke server Firebase. Periksa koneksi internet Anda.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat sebelum mencoba kembali.';
    default:
      return 'Terjadi kendala saat autentikasi. Silakan periksa koneksi atau coba lagi.';
  }
};

/**
 * 1. Masuk dengan Akun Google (Real Firebase Google Sign-In with Popup)
 */
export const signInWithGoogle = async (): Promise<UserProfile> => {
  const result = await signInWithPopup(auth, googleProvider);
  return formatFirebaseUser(result.user, 'siswa', 'google');
};

/**
 * 2. Masuk dengan Email & Kata Sandi (Real Firebase Email Sign-In)
 */
export const signInWithEmail = async (email: string, pass: string, role: 'siswa' | 'guru' = 'siswa'): Promise<UserProfile> => {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return formatFirebaseUser(result.user, role, 'email');
};

/**
 * 3. Daftar Akun Baru dengan Email & Kata Sandi (Real Firebase Register)
 */
export const registerWithEmail = async (
  email: string,
  pass: string,
  fullName: string,
  role: 'siswa' | 'guru' = 'siswa'
): Promise<UserProfile> => {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  // Perbarui nama profil di Firebase
  if (fullName.trim()) {
    try {
      await updateProfile(result.user, { displayName: fullName.trim() });
    } catch {
      // ignore non-critical profile update error
    }
  }
  return formatFirebaseUser({ ...result.user, displayName: fullName.trim() } as User, role, 'email');
};

/**
 * 4. Kirim Tautan Reset Kata Sandi (Real Firebase Password Reset)
 */
export const resetUserPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

/**
 * 5. Keluar dari Akun (Real Firebase Sign-Out)
 */
export const logoutFromFirebase = async (): Promise<void> => {
  await signOut(auth);
};

export { onAuthStateChanged };
