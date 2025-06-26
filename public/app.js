// Firebase v9 Modular SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";


const toggleSwitch = document.getElementById("toggleSwitch");


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

// ✅ Initialize Firebase and Realtime Database
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ DOM elements
const espStatus = document.getElementById("espStatus");
const toggleBtn = document.getElementById("toggleBtn");
const pwmSlider = document.getElementById("pwmSlider");
const digitalStatus = document.getElementById("digitalStatus");
const pwmValue = document.getElementById("pwmValue");
const ldrValue = document.getElementById("ldrValue");
const voltageValue = document.getElementById("voltageValue");

let ledState = false;

// 🟢 Toggle LED (digital)
toggleSwitch.onchange = () => {
  const state = toggleSwitch.checked;
  set(ref(db, "LED/digital"), state);
};

// 🔧 Handle PWM slider input
pwmSlider.oninput = () => {
  const value = parseInt(pwmSlider.value);
  set(ref(db, "LED/analog"), value);
  pwmValue.innerText = `PWM: ${value}`;
};

// 🔁 Sync slider value from Firebase
onValue(ref(db, "LED/analog"), snapshot => {
  const val = snapshot.val();
  pwmSlider.value = val;
  pwmValue.innerText = `PWM: ${val}`;
});

onValue(ref(db, "LED/digital"), snapshot => {
  const val = snapshot.val();
  toggleSwitch.checked = val;
  digitalStatus.innerText = `Status: ${val ? "ON" : "OFF"}`;
});

// 🌞 LDR sensor value
onValue(ref(db, "Sensor/ldr_data"), snapshot => {
  const val = snapshot.val();
  ldrValue.innerText = `LDR: ${val}`;
});

// 🔋 Voltage value
onValue(ref(db, "Sensor/voltage"), snapshot => {
  const val = snapshot.val();
  voltageValue.innerText = `Voltage: ${val.toFixed(2)} V`;
});

// 🔄 Online/Offline status
const OFFLINE_THRESHOLD = 45; // seconds
function checkESPStatus() {
  const lastSeenRef = ref(db, "device/last_seen");

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
      espStatus.innerText = "ESP32 is Offline for " + diff + " seconds ask Pranjal Kharel to connect it.";
      espStatus.style.color = "red";
    }
  });
}

checkESPStatus();









