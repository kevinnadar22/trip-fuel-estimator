<div align="center">

# 🚗 Ride Fuel Cost Calculator

**Ever wondered how much fuel your Uber/Ola/Rapido ride actually burned?**  
This tool tells you the *real* fuel cost — not the platform price, but what it actually costs in petrol/diesel.

[![Built with Gemini AI](https://img.shields.io/badge/Powered%20by-Gemini%20AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?style=flat-square&logo=node.js)](https://nodejs.org)

</div>

---

## 🤔 What does this do?

Simple: **take a screenshot of your ride receipt → upload it → get the actual fuel cost.**

The app reads your ride screenshot (from Uber, Ola, or Rapido), figures out the distance, and calculates how much fuel was burned based on:
- 🛣️ The trip distance (auto-read from the screenshot)
- ⛽ Fuel price in your city (auto-detected or you can enter it)
- 🚙 Your vehicle's mileage (auto-guessed or you can enter it)

No manual typing needed. Just upload and go.

---

## 🚀 Run It Yourself (5-minute setup)

**You'll need:** [Node.js](https://nodejs.org) installed on your computer.

### Step 1 — Download the code
```bash
git clone https://github.com/kevinnadar22/trip-fuel-estimator
cd trip-fuel-estimator
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Add your API keys

Create a file called `.env` in the project folder and add:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

> 💡 Get an OpenRouter API key at [openrouter.ai](https://openrouter.ai/) and a Google Maps API key via [Google Cloud Console](https://console.cloud.google.com/).

### Step 4 — Start the app
```bash
npm run dev
```

Open your browser and go to **http://localhost:5173** — done! 🎉

---

## 📸 How to use

1. Open Uber / Ola / Rapido on your phone
2. Go to your ride history and take a screenshot of any completed trip
3. Upload that screenshot to this app
4. (Optional) Enter your vehicle's mileage and local fuel price
5. Hit **"Calculate Actual Fuel Cost"**

That's it. You'll see a breakdown of the distance, fuel used, and the actual fuel cost.

---

## 🛠️ Tech Stack

| What | Tool |
|------|------|
| Frontend | React + TypeScript |
| UI Components | Material UI |
| AI / Vision | Google Gemini |
| Backend | Node.js (Express) |

---

## 📄 License

MIT — free to use, fork, and build upon.
