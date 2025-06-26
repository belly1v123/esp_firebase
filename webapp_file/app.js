// Firebase config
const ldrValue = document.getElementById("ldrValue");
const voltageValue = document.getElementById("voltageValue");
const espStatus = document.getElementById("espStatus");
const lastSeenDisplay = document.getElementById("lastSeen");


const firebaseConfig = {
  apiKey: "AIzaSyCz6wSWlAj3TVCGNpIgQCXwnP33qZ8X31U",
  databaseURL: "https://pk-esp32-rtdb-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM Elements
const toggleBtn = document.getElementById("toggleBtn");
const pwmSlider = document.getElementById("pwmSlider");
const digitalStatus = document.getElementById("digitalStatus");
const pwmValue = document.getElementById("pwmValue");

let ledState = false;

// Handle LED toggle
toggleBtn.onclick = () => {
  ledState = !ledState;
  db.ref("LED/digital").set(ledState);
};

// Listen for changes in LED state
db.ref("LED/digital").on("value", snapshot => {
  const val = snapshot.val();
  ledState = val;
  digitalStatus.innerText = `Status: ${val ? "ON" : "OFF"}`;
});

// PWM Slider input
pwmSlider.oninput = () => {
  const value = parseInt(pwmSlider.value);
  db.ref("LED/analog").set(value);
  pwmValue.innerText = `PWM: ${value}`;
};

// Sync slider value with Firebase
db.ref("LED/analog").on("value", snapshot => {
  const val = snapshot.val();
  pwmSlider.value = val;
  pwmValue.innerText = `PWM: ${val}`;
});
// Listen for LDR value changes
db.ref("Sensor/ldr_data").on("value", snapshot => {
  const val = snapshot.val();
  ldrValue.innerText = `LDR: ${val}`;
});

// Listen for voltage value changes
db.ref("Sensor/voltage").on("value", snapshot => {
  const val = snapshot.val();
  voltageValue.innerText = `Voltage: ${val.toFixed(2)} V`;
});



const OFFLINE_THRESHOLD = 30; // seconds
function checkESPStatus() {
  const lastSeenRef = db.ref("/device/last_seen");

  lastSeenRef.on("value", (snapshot) => {
    if (!snapshot.exists()) {
      console.log("❌ No last_seen found in DB");
      espStatus.innerText = "❌ No data found";
      espStatus.style.color = "gray";
      return;
    }

    const lastSeen = snapshot.val();
    const now = Math.floor(Date.now() / 1000);
    const diff = now - lastSeen;

    if (diff < 30) {
      espStatus.innerText = "✅ ESP32 is Online";
      espStatus.style.color = "green";
    } else {
      espStatus.innerText = "🚫 ESP32 is Offline";
      espStatus.style.color = "red";
    }

    lastSeenDisplay.innerText = "🕒 Last Seen: " + new Date(lastSeen * 1000).toLocaleString();
  });
}

checkESPStatus();
