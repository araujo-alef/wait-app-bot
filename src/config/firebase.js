require("dotenv").config();
const firebase = require("firebase/app");

const firebaseConfig = {
    apiKey: "AIzaSyDK7wia6eyAKTZIyVswsFrEnOSZb5ihTFg",
    authDomain: "kadore-e-pagers.firebaseapp.com",
    projectId: "kadore-e-pagers",
    storageBucket: "kadore-e-pagers.appspot.com",
    messagingSenderId: "971966930729",
    appId: "1:971966930729:web:8606140fbfc9cf31072138",
    measurementId: "G-6G5HD5Y2ZF"
};

firebase.initializeApp(firebaseConfig);