# React Native Mobile App - Setup Guide

## Quick Start

This guide will help you get the React Native mobile application up and running.

## Prerequisites

Before you begin, make sure you have:

1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org)
   - Verify: `node --version`

2. **npm or yarn**
   - Comes with Node.js
   - Verify: `npm --version`

3. **Expo CLI**

   ```bash
   npm install -g expo-cli
   ```

4. **Mobile Device or Emulator**
   - iOS: Xcode simulator
   - Android: Android Studio emulator
   - Or: Physical device with Expo Go app

5. **Backend API Running**
   - Backend should be running on `http://localhost:5000`
   - See backend README for setup instructions

## Step-by-Step Installation

### 1. Navigate to Mobile Directory

```bash
cd mobile
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`.

### 3. Configure Environment (Optional)

If your backend is on a different URL, update `services/apiClient.ts`:

```typescript
const API_BASE_URL = "http://your-backend-url/api";
```

### 4. Start the Development Server

```bash
npm start
```

or

```bash
expo start
```

This will start the Expo development server and display a QR code.

### 5. Run on Device/Emulator

#### Option A: Expo Go (Easiest)

1. Install **Expo Go** app on your phone
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code from the terminal with your phone
3. The app will open on your device

#### Option B: iOS Simulator

```bash
npm run ios
```

or

```bash
expo start --ios
```

#### Option C: Android Emulator

```bash
npm run android
```

or

```bash
expo start --android
```

## Testing the App

Once the app is running:

### 1. Test Login/Registration

- Use the register screen to create a test account
- Or login with existing credentials from backend

### 2. Navigation

- Bottom tabs for Students: Feed, Summary, Reminders, Departments, Profile
- Bottom tabs for Admins: Dashboard, Create Event, Users, Profile

### 3. Test Features

**Student Features:**

- View event feed with AI matching
- Browse departments
- Create reminders
- View AI summary
- Update profile and interests
- Rate events

**Admin Features:**

- View dashboard analytics
- Create new events (3-step wizard)
- View and manage users
- Track engagement metrics

## Troubleshooting

### Issue: "Cannot find module" or dependency errors

**Solution:**

```bash
rm -rf node_modules package-lock.json
npm install
npm start -- --reset-cache
```

### Issue: API connection not working

**For localhost:**

- Desktop: Use `http://localhost:5000`
- iOS Simulator: Use `localhost` or your machine IP
- Android Emulator: Use `10.0.2.2:5000`
- Physical Device: Use your machine's local IP (e.g., `192.168.x.x:5000`)

**To find your machine IP:**

**macOS/Linux:**

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**

```bash
ipconfig
```

Then update `services/apiClient.ts`:

```typescript
const API_BASE_URL = "http://192.168.x.x:5000/api";
```

### Issue: Notifications not working

1. Check permissions:
   - iOS: Settings > App > Notifications > Allow
   - Android: App permissions > Notifications

2. Verify backend Firebase setup

3. Check FCM token is being sent:
   - Check console logs in Expo
   - Verify token in user profile API

### Issue: App crashes on startup

**Solution:**

```bash
# Clear all caches
npm start -- --reset-cache

# Or remove expo cache
rm -rf .expo/
npm start
```

### Issue: "Watchman crawl warning"

On macOS, install watchman:

```bash
brew install watchman
```

## Development Workflow

### Making Changes

1. Edit files in `screens/`, `services/`, or `stores/`
2. Save the file
3. Changes automatically reload in the app (Hot Reload)
4. If Hot Reload doesn't work, press `r` in terminal

### Adding New Screens

1. Create new file in appropriate directory
2. Import in `navigation/MainStack.tsx` or `AuthStack.tsx`
3. Add to navigation stack

### Adding New Dependencies

```bash
npm install <package-name>
```

For Expo-specific packages:

```bash
expo install <package-name>
```

## Building for Production

### Using EAS (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

### Local Building

**iOS:**

```bash
npm run ios
```

**Android:**

```bash
npm run android
```

## Environment Configuration

Create `.env` file for production environment variables:

```env
EXPO_PUBLIC_API_URL=https://your-production-api.com/api
EXPO_PUBLIC_FIREBASE_API_KEY=your_key
# ... other variables
```

Environment variables must start with `EXPO_PUBLIC_` to be accessible in the app.

## Debugging

### Using Expo DevTools

Press `d` in the terminal when app is running:

- DevTools opens in browser
- View console logs
- Toggle remote debugging

### Console Logs

View logs with:

```bash
npm start
```

Or in Xcode/Android Studio emulator console.

### Network Requests

Enable network debugging in `services/apiClient.ts`:

```typescript
// Add to interceptor
this.client.interceptors.response.use(
  (response) => {
    console.log("Response:", response);
    return response;
  },
  (error) => {
    console.error("Error:", error);
    return Promise.reject(error);
  },
);
```

## Performance Tips

1. **Reduce Bundle Size**
   - Remove unused imports
   - Use code splitting
   - Tree shake dependencies

2. **Optimize Re-renders**
   - Use `useMemo` and `useCallback`
   - Separate components properly
   - Avoid inline object creation

3. **Image Optimization**
   - Use appropriate sizes
   - Use WebP format where possible
   - Lazy load images

4. **Monitor Performance**
   - Check FPS in DevTools
   - Profile with React DevTools
   - Monitor memory usage

## Useful Commands

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Clear all caches
npm start -- --reset-cache

# Install a new package
npm install <package>

# Update all dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Build for production (EAS)
eas build --platform all
```

## Next Steps

1. Customize the app with your branding
2. Configure Firebase for notifications
3. Deploy backend API
4. Set up production environment
5. Build and submit to app stores

## Support Resources

- **Expo Docs**: https://docs.expo.dev
- **React Native Docs**: https://reactnative.dev
- **React Navigation**: https://reactnavigation.org
- **Zustand**: https://github.com/pmndrs/zustand

## Need Help?

If you encounter issues:

1. Check the Troubleshooting section above
2. Review logs in terminal
3. Check Expo DevTools (`d` key)
4. Read official documentation
5. Check GitHub issues

---

**Happy coding! 🚀**
