# Weather App - Mobile Programming Project

## Overview
This Weather App is a mobile application developed for the Android platform as part of the Mobile Programming course by Group 07. Built using **React Native** and **Expo**, the app provides real-time weather updates, including temperature, humidity, wind, and forecasts for the next hours and days. It emphasizes user-friendly features like city search, favorite locations management, and customizable weather notifications.

## Features
- **View Weather Forecast**: Displays current weather, hourly updates, and a 5-day forecast for the user's default or selected location.
- **Search City**: Allows users to search for weather information by city and add cities to a favorites list.
- **Manage Locations**: Users can manage a list of favorite cities, set a default city, and view weather details for saved locations.
- **Set Weather Reminders**: Enables users to schedule weather notifications based on their routine.
- **Receive Weather Notifications**: Sends weather updates at user-defined times or defaults to 6:00 AM and 4:00 PM.

## Prerequisites
To run the project, ensure you have the following installed:
- **Node.js** (version 16.20.0 or higher)
- **npm** (included with Node.js)
- **Expo CLI** (`npm install -g expo-cli`)
- **Android Studio** with Android SDK
- **Java Development Kit (JDK)** (version 11 or higher)
- A code editor (e.g., **VS Code**)

## Setup Instructions
Follow these steps to set up and run the Weather App on your local machine:

### 1. Set Up ADB (Android Debug Bridge)
- Install **Android Studio** and ensure the Android SDK is included.
- Locate the SDK path:
  - **macOS**: `~/Library/Android/sdk`
  - **Windows**: `C:\Users\<YourUser>\AppData\Local\Android\Sdk`
- Add the `platform-tools` folder to your system’s PATH:
  - **macOS/Linux**:
    ```bash
    export PATH=$PATH:~/Library/Android/sdk/platform-tools
    ```
  - **Windows**: Add `C:\Users\<YourUser>\AppData\Local\Android\Sdk\platform-tools` via System Environment Variables.
- Verify ADB installation:
  ```bash
  adb --version
  ```

### 2. Run Android Virtual Device (AVD) in Android Studio
- Open **Android Studio** and navigate to **Tools > Device Manager**.
- Create a new virtual device:
  - Select a device (e.g., Pixel 2) and a system image (e.g., API 31).
  - Download the system image if prompted, then click “Finish.”
- Start the emulator by clicking the green “Play” button next to your AVD in Device Manager.
- Wait for the emulator to fully boot.

### 3. Clone the Repository
- Clone the project repository:
  ```bash
  git clone https://github.com/hcmute-toan/WeatherApp_FinalProject.git
  cd WeatherApp_FinalProject
  ```
- Ensure the repository contains the `package.json` file.

### 4. Install Dependencies
- Install all required packages:
  ```bash
  npm install
  ```
  This installs dependencies like `expo`, `axios`, `expo-location`, etc.

### 5. Start the Expo Development Server
- Run the Expo CLI to start the Metro bundler:
  ```bash
  npx expo start
  ```
  This opens a terminal or browser with a QR code and run options.

### 6. Run the App on the Emulator
- With the Android emulator running, press `a` in the terminal where `npx expo start` is running.
- The app will build and launch in the emulator.

### 7. Troubleshooting
- Ensure the emulator is fully booted before pressing `a`.
- Verify ADB is running:
  ```bash
  adb devices
  ```
  Look for your emulator (e.g., `emulator-5554`).
- Check `app.json` or `app.config.js` for correct Android permissions (e.g., location, notifications).
- Use **Expo Developer Tools** or terminal logs for debugging.

## Technologies Used
### Frameworks
- **React Native**: Cross-platform mobile app development framework.
- **Expo**: Toolset for rapid development, testing, and deployment of React Native apps.

### Libraries
- **React Navigation**: For screen navigation.
- **Axios**: For API requests.
- **Formik & Yup**: For form management and data validation.
- **expo-location**: To access device location.
- **expo-notifications**: For push notifications.
- **expo-av**: For audio/video processing.
- **react-native-chart-kit**: For displaying charts.
- **react-native-svg & react-native-svg-transformer**: For SVG graphics.
- **@react-native-community/datetimepicker & react-native-modal-datetime-picker**: For date/time selection.
- **@react-native-async-storage/async-storage**: For local data storage.
- **@expo/vector-icons**: For vector icons.
- **react-native-reanimated & react-native-reanimated-carousel**: For animations and carousels.

## References
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
- [Axios Documentation](https://axios-http.com/)
- [Formik Documentation](https://formik.org/)
- [Yup Documentation](https://github.com/jquense/yup)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit)
- [React Native SVG](https://github.com/software-mansion/react-native-svg)

## Future Improvements
- Implement **Ask Weather via Voice** feature for voice-based weather queries.
- Add **Interact with Virtual Pet** feature to enhance user engagement.

## Contributors
- **Van Cong Toan** (Group Leader, Student ID: 22110079)
- **Phan Dinh Trung** (Student ID: 22110083)
