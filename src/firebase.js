import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyD0HC-NvFOO2ojwhqhi7mxfmGbUlog7Xhw",
  authDomain: "legit-tutots.firebaseapp.com",
  projectId: "legit-tutots",
  storageBucket: "legit-tutots.firebasestorage.app",
  messagingSenderId: "656395612665",
  appId: "1:656395612665:web:418c56b55913db35dc0d28",
  measurementId: "G-R5DTC7FSQX"
};

const app = initializeApp(firebaseConfig);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;
export { getToken, onMessage };