#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include <time.h>

// WiFi & Firebase Credentials
#define WIFI_SSID "Pranjal_2.4"
#define WIFI_PASSWORD "PK@98400"
#define API_KEY "yourKey"
#define DATABASE_URL "https:yourDatabaseURL"

// GPIO Definitions
#define LED_ANALOG_PIN 12  // For ledcWrite()
#define LED_DIGITAL_PIN 14 // For digitalWrite()
#define LDR_PIN 36
#define PWMChannel 0

// PWM Settings
const int freq = 5000;
const int resolution = 8;

// Firebase
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
bool signupOK = false;

void setup()
{
  // Pin Config
  pinMode(LED_DIGITAL_PIN, OUTPUT);
  ledcSetup(PWMChannel, freq, resolution);
  ledcAttachPin(LED_ANALOG_PIN, PWMChannel);

  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(300);
  }
  Serial.println("\nConnected with IP: " + WiFi.localIP().toString());

  // Firebase Setup
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  config.token_status_callback = tokenStatusCallback;

  if (Firebase.signUp(&config, &auth, "", ""))
  {
    Serial.println("Firebase signUp OK");
    signupOK = true;
  }
  else
  {
    Serial.printf("SignUp Error: %s\n", config.signer.signupError.message.c_str());
  }

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  // Configure NTP time
  configTime(0, 0, "pool.ntp.org");
  struct tm timeinfo;

  Serial.print("Syncing NTP time");
  while (!getLocalTime(&timeinfo))
  {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nTime synchronized.");
}

void loop()
{
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 5000 || sendDataPrevMillis == 0))
  {
    sendDataPrevMillis = millis();

    int ldrData = analogRead(LDR_PIN);
    float voltage = (float)analogReadMilliVolts(LDR_PIN) / 1000;

    // 🔴 SEND DEVICE "last seen" TIMESTAMP
    time_t now = time(nullptr); // Get current Unix timestamp from NTP
    if (Firebase.RTDB.setInt(&fbdo, "/device/last_seen", now))
    {
      Serial.println("✅ Last seen updated: " + String(now));
    }
    else
    {
      Serial.println("❌ Failed to update last seen: " + fbdo.errorReason());
    }

    // Send LDR data
    if (Firebase.RTDB.setInt(&fbdo, "Sensor/ldr_data", ldrData))
      Serial.println("LDR: " + String(ldrData));
    else
      Serial.println("LDR upload failed: " + fbdo.errorReason());

    // Send Voltage
    if (Firebase.RTDB.setFloat(&fbdo, "Sensor/voltage", voltage))
      Serial.println("Voltage: " + String(voltage) + "V");
    else
      Serial.println("Voltage upload failed: " + fbdo.errorReason());
  }

  // Get analog PWM value
  if (Firebase.RTDB.getInt(&fbdo, "/LED/analog/"))
  {
    if (fbdo.dataType() == "int")
    {
      int pwmValue = fbdo.intData();
      ledcWrite(PWMChannel, pwmValue);
      Serial.println("PWM Value: " + String(pwmValue));
    }
  }

  // Get digital LED status
  if (Firebase.RTDB.getBool(&fbdo, "/LED/digital/"))
  {
    if (fbdo.dataType() == "boolean")
    {
      bool ledStatus = fbdo.boolData();
      digitalWrite(LED_DIGITAL_PIN, ledStatus ? HIGH : LOW);
      Serial.println("Digital LED: " + String(ledStatus ? "ON" : "OFF"));
    }
  }
}
