```markdown
# WeatherApp - Final Project for Mobile Programming

## 📱 Project Overview

**WeatherApp** is a mobile application built with **React Native**, **Expo**, and **TypeScript**, designed to provide users with real-time weather information and forecasts.

This app supports current weather, short- and long-term forecasts, weather animations, smart reminders, voice interaction, and a fun virtual pet experience.

> This project was developed as the final project for the *Mobile Programming* course.

---

## 👨‍💻 Team Members

- **Văn Công Toàn** - 22110079  
- **Phan Đình Trung** - 22110083

---

## 🌟 Features

- 🌤️ View current weather and forecasts (1-day, 5-day, 12-hour)
- 📍 Location-based automatic weather updates
- 🔍 Search and view weather by city name
- ⭐ Add/remove favorite locations
- ⏰ Smart reminders (e.g., bring umbrella, stay hydrated)
- 👕 Clothing and activity suggestions based on weather
- 🔔 Push notifications at 6 AM and 4 PM
- 🎨 Weather animations (Lottie: rain, sunny, rainbow)
- 🐶 Virtual pet changes mood based on weather
- 🗣️ Voice interaction for queries  
  (e.g., “Chiều mai ở Hồ Gươm có mưa không?”)
- 💾 Offline storage for favorite cities
- ✅ Unit tests for core components
- 📱 Responsive design for various screen sizes

---


## 📂 Project Structure


WeatherApp/
├── src/
│   ├── components/          # Reusable UI components
│   ├── navigation/          # Navigation setup
│   ├── screens/             # Main app screens
│   ├── services/            # API and device services
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── assets/              # Images and animations
│   ├── tests/               # Unit tests
├── App.tsx                  # Main app entry point
├── app.json                 # Expo configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── README.md                # Project documentation


---

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- npm or Yarn
- [Expo CLI](https://docs.expo.dev/) (`npm install -g expo-cli`)
- Expo Go app (for testing on mobile)
- A Weather API key (e.g., from [OpenWeatherMap](https://openweathermap.org/))

---

## 🚀 Setup Instructions

1. **Clone the repository**

   git clone <repository-url>
   cd WeatherApp


2. **Install dependencies**


   npm install


3. **Configure the Weather API**

   * Sign up at [OpenWeatherMap](https://openweathermap.org/) to get an API key.
   * Replace `YOUR_OPENWEATHERMAP_API_KEY` in `src/services/weatherApi.ts` with your actual API key.

4. **Run the app**


   npm start


   * Scan the QR code with Expo Go, or press:

     * `a` for Android emulator
     * `i` for iOS simulator

5. **Run tests**


   npm test


---

## 🙏 Acknowledgments

* **Course:** Mobile Programming
* **Instructors:** PhD Huỳnh Xuân Phụng
* **Technologies Used:**
  React Native, TypeScript, Expo, OpenWeatherMap API, Lottie

---

## 📌 Notes

* Voice interaction and some advanced features are currently **placeholders** and may require external service integration (e.g., speech-to-text).
* Ensure that your Lottie animation files (`rain.json`, `sunny.json`, etc.) are placed inside:

  src/assets/animations/


