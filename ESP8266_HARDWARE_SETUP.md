# ESP8266 Smart RFID Trolley Hardware Integration Guide

This guide details how your **ESP8266 NodeMCU** hardware setup connects directly to **Firebase Realtime Database** so that every RFID item scan and completed purchase appears in real-time on your Supermarket Management Dashboard.

---

## 🛠️ Hardware Setup

- **Microcontroller**: ESP8266 NodeMCU
- **RFID Reader**: MFRC522 (SPI Interface)
- **Display**: 16x2 I2C LCD (SDA: D2 / GPIO4, SCL: D1 / GPIO5)
- **Push Buttons**:
  - **Button 1 (ADD)**: D3 (GPIO0)
  - **Button 2 (REMOVE / DELETE)**: D4 (GPIO2)
  - **Button 3 (CHECKOUT / BILL)**: D8 (GPIO15)

---

## 📡 Database JSON Format Sent to Firebase

The ESP8266 pushes completed purchase transactions under the node `purchases/{transactionId}`:

```json
{
  "customerID": "CUST-8041",
  "trolleyID": "TR-01",
  "total": 84.50,
  "timestamp": 1787834500000,
  "paymentStatus": "Completed",
  "products": {
    "P-101": {
      "name": "Organic Milk 1L",
      "price": 4.50,
      "quantity": 2
    },
    "P-102": {
      "name": "Whole Wheat Bread",
      "price": 3.20,
      "quantity": 1
    }
  }
}
```

---

## 📜 Complete ESP8266 Arduino C++ Code Example

Copy and flash this code onto your ESP8266 using the Arduino IDE.

```cpp
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// 1. WiFi Credentials
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// 2. Firebase Credentials
#define FIREBASE_HOST "https://YOUR-PROJECT-default-rtdb.firebaseio.com/"
#define FIREBASE_AUTH "YOUR_FIREBASE_DATABASE_SECRET_OR_WEB_API_KEY"

// 3. Hardware Pins
#define SS_PIN D8
#define RST_PIN D0
#define BTN_ADD D3
#define BTN_REMOVE D4
#define BTN_CHECKOUT D7

MFRC522 rfid(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x27, 16, 2);

FirebaseData firebaseData;
FirebaseJson json;

String trolleyID = "TR-01";
String currentCustomerID = "CUST-8041";
float cartTotal = 0.0;

void setup() {
  Serial.begin(115200);
  SPI.begin();
  rfid.PCD_Init();
  
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Smart Trolley");
  lcd.setCursor(0, 1);
  lcd.print("Connecting WiFi...");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("WiFi Connected!");
  delay(1000);

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Scan Product RFID");
}

void loop() {
  // Check for RFID Tag Scans
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    String tagUID = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
      tagUID += String(rfid.uid.uidByte[i] < 0x10 ? "0" : "");
      tagUID += String(rfid.uid.uidByte[i], HEX);
    }
    tagUID.toUpperCase();
    
    Serial.println("Scanned Tag: " + tagUID);
    processProductScan(tagUID);
    rfid.PICC_HaltA();
  }

  // Check Checkout Button Press
  if (digitalRead(BTN_CHECKOUT) == LOW) {
    delay(200);
    sendBillToFirebase();
  }
}

void processProductScan(String tagUID) {
  String prodName = "Item " + tagUID.substring(0, 4);
  float prodPrice = 5.00; // Look up product price by RFID UID

  cartTotal += prodPrice;

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(prodName);
  lcd.setCursor(0, 1);
  lcd.print("Total: $" + String(cartTotal));
}

void sendBillToFirebase() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Sending Bill...");

  String txId = "TX-" + String(millis());
  String path = "/purchases/" + txId;

  json.clear();
  json.set("customerID", currentCustomerID);
  json.set("trolleyID", trolleyID);
  json.set("total", cartTotal);
  json.set("timestamp", millis());
  json.set("paymentStatus", "Completed");

  if (Firebase.setJSON(firebaseData, path, json)) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Bill Sent!");
    lcd.setCursor(0, 1);
    lcd.print("Total: $" + String(cartTotal));
    cartTotal = 0.0;
  } else {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Firebase Error!");
  }
  delay(2000);
}
```

---

## ⚡ How to Connect Live Dashboard to Your Real Firebase:

1. Click **"Firebase Config"** on the top status banner in the dashboard.
2. Enter your Firebase Database URL (e.g. `https://your-project-default-rtdb.firebaseio.com`) and Web API Key.
3. Click **"Save & Connect Live"**.
4. The dashboard will instantly listen to your ESP8266 real-time purchase updates without dummy data!
