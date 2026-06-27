import firebase from 'firebase';
import 'firebase/auth';
import 'firebase/database';

const config = firebase.default.initializeApp({
    apiKey: "AIzaSyDV5sMZemL6-hGFbBOjQ9kJEIIebbeTm6U",
    authDomain: "evalion-da90f.firebaseapp.com",
    databaseURL: "https://evalion-da90f-default-rtdb.firebaseio.com",
    projectId: "evalion-da90f",
    storageBucket: "evalion-da90f.firebasestorage.app",
    messagingSenderId: "92713590258",
    appId: "1:92713590258:web:e767f97aa7c814ec7a5f6b",
    measurementId: "G-CKSDS6R862"
});

export const auth = firebase.auth();
export default config;
