/**
 * config/firebase.ts
 * Inisialisasi dan Layanan Firebase untuk ReaksiLab XI.
 *
 * Menggunakan Firebase SDK resmi dengan kredensial dari .env (Vite)
 * dilengkapi nilai fallback cerdas dan penanganan error defensif
 * agar aplikasi tidak pernah mengalami blank screen putih jika konfigurasi belum lengkap.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  onAuthStateChanged as fbOnAuthStateChanged,
  type User,
  type Auth,
} from 'firebase/auth';
import type { UserProfile } from '../types';

// Membersihkan nilai env dari kemungkinan tanda kutip
const cleanEnv = (val?: string): string => {
  if (!val) return '';
  return val.replace(/^["']|["']$/g, '').trim();
};

// Konfigurasi Firebase dengan fallback proyek reaksilab-xi-laju-reaksi
export const firebaseConfig = {
  apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY) || 'AIzaSyBVBDxu7pNV9xCL3iW9CPDyjiUhQO3BeLE',
  authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || 'reaksilab-xi-laju-reaksi.firebaseapp.com',
  projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID) || 'reaksilab-xi-laju-reaksi',
  storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || 'reaksilab-xi-laju-reaksi.firebasestorage.app',
  messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || '806016842549',
  appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID) || '1:806016842549:web:2053b74b83739b7af16a7c',
  measurementId: cleanEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) || 'G-GCZYY4LYJD',
};

// Inisialisasi Firebase secara aman (Defensive Initialization)
// Mencegah uncaught exception saat bundle dimuat di peramban
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let isInitialized = false;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10) {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    authInstance = getAuth(appInstance);
    isInitialized = true;
  } else {
    console.warn('Firebase API Key belum terkonfigurasi. Mode fallback aktif.');
  }
} catch (err) {
  console.warn('Peringatan inisialisasi Firebase (Safe Mode aktif):', err);
}

export const app = appInstance as FirebaseApp;
export const auth = authInstance as Auth;
export const isFirebaseConfigured = isInitialized;

// Provider Autentikasi Google
export const googleProvider = new GoogleAuthProvider();
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
    case 'auth/invalid-api-key':
      return 'Kunci API Firebase tidak valid atau belum diatur di Cloudflare Pages.';
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
      return 'Domain Cloudflare ini (*.pages.dev) belum diizinkan di Firebase Console. Harap tambahkan domain ini pada menu Authentication -> Settings -> Authorized domains di Firebase Console.';
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
  if (!authInstance || !isInitialized) {
    throw { code: 'auth/invalid-api-key', message: 'Layanan Firebase belum siap.' };
  }
  const result = await signInWithPopup(authInstance, googleProvider);
  return formatFirebaseUser(result.user, 'siswa', 'google');
};

/**
 * 2. Masuk dengan Email & Kata Sandi (Real Firebase Email Sign-In)
 */
export const signInWithEmail = async (email: string, pass: string, role: 'siswa' | 'guru' = 'siswa'): Promise<UserProfile> => {
  if (!authInstance || !isInitialized) {
    throw { code: 'auth/invalid-api-key', message: 'Layanan Firebase belum siap.' };
  }
  const result = await signInWithEmailAndPassword(authInstance, email, pass);
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
  if (!authInstance || !isInitialized) {
    throw { code: 'auth/invalid-api-key', message: 'Layanan Firebase belum siap.' };
  }
  const result = await createUserWithEmailAndPassword(authInstance, email, pass);
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
  if (!authInstance || !isInitialized) {
    throw { code: 'auth/invalid-api-key', message: 'Layanan Firebase belum siap.' };
  }
  await sendPasswordResetEmail(authInstance, email);
};

/**
 * 5. Keluar dari Akun (Real Firebase Sign-Out)
 */
export const logoutFromFirebase = async (): Promise<void> => {
  if (authInstance && isInitialized) {
    await signOut(authInstance);
  }
};

/**
 * Wrapper Aman untuk onAuthStateChanged
 */
export const onAuthStateChanged = (
  authObj: Auth,
  callback: (user: User | null) => void
): (() => void) => {
  if (!authObj || !isInitialized) {
    return () => {};
  }
  try {
    return fbOnAuthStateChanged(authObj, callback);
  } catch (err) {
    console.warn('onAuthStateChanged safe error catch:', err);
    return () => {};
  }
};
