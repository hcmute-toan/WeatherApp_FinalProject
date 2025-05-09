````markdown
# WeatherApp - Final Project for Mobile Programming

**WeatherApp** is a mobile application built with **React Native** and **TypeScript**, designed to deliver real-time weather information and forecasts. It supports features such as current weather display, 1-day/5-day/12-hour forecasts, smart reminders, clothing suggestions, and more. The app also includes advanced features like weather animations, a virtual pet, push notifications, and voice interaction.

> This project was developed as the final assignment for the **Mobile Programming** course.

## 👥 Team Members

- Văn Công Toàn - 22110079  
- Phan Đình Trung - 22110083

## 🌤️ Features

- View current weather and detailed forecasts (1-day, 5-day, 12-hour).
- Automatic weather updates based on user's current location.
- Search and view weather by city name.
- Add or remove favorite cities.
- Smart weather-based reminders (e.g., bring an umbrella, stay hydrated).
- Clothing and activity suggestions tailored to the weather.
- Push notifications at 6 AM and 4 PM for weather updates.
- Animated weather visuals using Lottie (e.g., rain, sunny, rainbow).
- A virtual pet that changes its mood based on the weather.
- Voice interaction for weather-related queries (e.g., "Will it rain at Hoan Kiem Lake tomorrow afternoon?").
- Offline storage for saved cities and preferences.
- Unit tests for core components.
- Responsive design for various screen sizes.

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or Yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app (for testing on a real device)
- Weather API key (e.g., from OpenWeatherMap)

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd WeatherApp
````

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the Weather API:

   * Sign up at [OpenWeatherMap](https://openweathermap.org/api) to get your API key.
   * Replace `YOUR_OPENWEATHERMAP_API_KEY` in `src/services/weatherApi.ts` with your key.

4. Run the app:

   ```bash
   npm run dev
   ```

   * Use the Expo Go app to scan the QR code.
   * Or press `a` (Android) or `i` (iOS) to open the app in an emulator.

5. Run tests:

   ```bash
   npm test
   ```

## 📌 Notes

* Voice interaction and some advanced features are implemented as placeholders and may require further configuration (e.g., integration with speech-to-text services).
* Ensure all necessary Lottie animation files are placed in `src/assets/animations/` for proper visual effects.

## 🎓 Acknowledgments

* **Course**: Mobile Programming
* **Instructors**: \[Add instructor names if applicable]
* **Technologies**: React Native, TypeScript, Expo, OpenWeatherMap API, Lottie
