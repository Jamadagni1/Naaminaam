// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBhJPREWX_nASH9RihG17TsbJCsgoqchSc",
  authDomain: "naamin-bfc7a.firebaseapp.com",
  projectId: "naamin-bfc7a",
  storageBucket: "naamin-bfc7a.firebasestorage.app",
  messagingSenderId: "124693120714",
  appId: "1:124693120714:web:e5e994138c11c18577d633",
  measurementId: "G-XENRMFB633"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);