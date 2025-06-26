// Firebase v9 Modular SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// ✅ Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCz6wSWlAj3TVCGNpIgQCXwnP33qZ8X31U",
  authDomain: "pk-esp32-rtdb.firebaseapp.com",
  databaseURL: "https://pk-esp32-rtdb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pk-esp32-rtdb",
  storageBucket: "pk-esp32-rtdb.appspot.com",
  messagingSenderId: "249358123401",
  appId: "1:249358123401:web:89677df379d07f11d3ae2e"
};

// ✅ Initialize Firebase and DB
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ DOM elements
const espStatus = document.getElementById("espStatus");

const OFFLINE_THRESHOLD = 45; // seconds

// ✅ Check ESP32 Online/Offline status
function checkESPStatus() {
  const lastSeenRef = ref(db, "/device/last_seen");

  onValue(lastSeenRef, (snapshot) => {
    if (!snapshot.exists()) {
      espStatus.innerText = "❌ No status available";
      espStatus.style.color = "gray";
      return;
    }

    const lastSeen = snapshot.val();
    const now = Math.floor(Date.now() / 1000);
    const diff = now - lastSeen;

    if (diff < OFFLINE_THRESHOLD) {
      espStatus.innerText = "ESP32 is Online";
      espStatus.style.color = "green";
    } else {
      espStatus.innerText = "ESP32 is Offline ask pranjalkharel to check";
      espStatus.style.color = "red";
    }
  });
}

checkESPStatus();
