# Prayer Times Countdown with Study Schedule

A web application that displays prayer times, exam schedules, and provides a checklist feature for tracking study progress across multiple devices.

## Features

- Prayer times countdown
- Exam schedule view (by subject and chronological)
- Study schedule with checklist functionality
- Cross-device syncing of checklist state via Firebase

## Firebase Setup for Cross-Device Checklist

To enable the cross-device checklist functionality, you need to set up Firebase:

1. **Create a Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter a project name (e.g., "Prayer Times Countdown")
   - Follow the setup wizard (you can disable Google Analytics if you want)
   - Click "Create project"

2. **Add a web app to your Firebase project:**
   - From the project overview page, click the web icon (</>) to add a web app
   - Register your app with a nickname (e.g., "Prayer Times Web App")
   - You don't need to set up Firebase Hosting for this to work
   - Copy the Firebase configuration object

3. **Update the Firebase configuration in your code:**
   - Open the `firebase-config.js` file
   - Replace the placeholder values with your actual Firebase configuration:
     ```javascript
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
     };
     ```

4. **Set up Firestore Database:**
   - In the Firebase console, go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" for development (you can adjust security rules later)
   - Select a location for your database that's closest to your users
   - Click "Enable"

5. **Deploy your application:**
   - Upload your files to your web hosting (like GitHub Pages)
   - The checklist functionality should now sync across devices

## Security Note

The current Firebase configuration uses test mode, which allows anyone to read and write to your database. For a production application, you should set up proper security rules.

## Using with GitHub Pages

This project is fully compatible with GitHub Pages as it uses Firebase for backend functionality.

## Local Development

To run the project locally, you can use any local server. For example, with Python:

```bash
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

Then open `http://localhost:8000` in your browser. 