// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDMW5HcMItMqa1C80KBV5ns4ArCfbY3pCQ",
  authDomain: "barber-1cb72.firebaseapp.com",
  projectId: "barber-1cb72",
  storageBucket: "barber-1cb72.appspot.com",
  messagingSenderId: "1046332862646",
  appId: "1:1046332862646:web:5d74b7c8996e8aaca1f617",
  measurementId: "G-V70LX8T15B"
};

const app = initializeApp(firebaseConfig);

// إعداد التخزين (Storage)
export const storage = getStorage(app);


