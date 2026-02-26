# Event Alert & Reminder System - React Native Mobile App

A modern, feature-rich React Native mobile application for the AI-based Event Alert and Reminder System. Stay updated with important events and reminders on your mobile device.

## 📱 Features

### For Students

- **AI-Powered Event Feed**: Personalized event recommendations based on your interests
- **Smart Notifications**: Push notifications for relevant events
- **Event Details**: Comprehensive event information, ratings, and RSVP
- **AI Summary**: One-minute condensed summaries of important notifications
- **Reminders**: Set personal reminders with deadlines
- **Department Browse**: Explore events by department
- **Profile Management**: Update your interests and preferences

### For Admins/Organizers

- **Dashboard**: Real-time analytics and engagement metrics
- **Event Creation**: Create smart events with AI targeting
- **User Management**: Manage users and their roles
- **Analytics**: Track event performance and engagement rates

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **State Management**: Zustand
- **API Client**: Axios with JWT auth
- **Notifications**: Firebase Cloud Messaging (FCM)
- **UI Components**: Custom components with React Native
- **Icons**: Lucide React Native
- **Styling**: React Native stylesheets

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Backend API running at `http://localhost:5000` (or configure the API URL)
- Firebase setup for notifications (optional)

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

or

```bash
yarn install
```

### 2. Configure API Endpoint

Edit `services/apiClient.ts` and update the `API_BASE_URL`:

```typescript
const API_BASE_URL = "http://your-backend-url/api";
```

For development:

```typescript
const API_BASE_URL = "http://localhost:5000/api";
```

### 3. Firebase Setup (Optional)

For push notifications to work:

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Add your app to the Firebase project
3. The app will automatically handle FCM tokens through Expo's notification system
4. Ensure your backend is configured with Firebase Admin SDK

### 4. Run the Application

**For Expo Go (Easiest)**:

```bash
npm start
# or
expo start
```

Then scan the QR code with the Expo Go app on your phone.

**For iOS**:

```bash
npm run ios
# or
expo start --ios
```

**For Android**:

```bash
npm run android
# or
expo start --android
```

## 📁 Project Structure

```
mobile/
├── App.tsx                 # Main entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies
│
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   ├── student/
│   │   ├── FeedScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── RemindersScreen.tsx
│   │   ├── AISummaryScreen.tsx
│   │   └── DepartmentsScreen.tsx
│   ├── admin/
│   │   ├── AdminDashboardScreen.tsx
│   │   ├── AdminCreateEventScreen.tsx
│   │   └── AdminUsersScreen.tsx
│   └── shared/
│       └── EventDetailScreen.tsx
│
├── navigation/
│   ├── AuthStack.tsx      # Auth navigation
│   └── MainStack.tsx      # App navigation (Tabs + Stacks)
│
├── services/
│   ├── apiClient.ts       # API service with Axios
│   └── notificationService.ts  # Firebase notifications setup
│
└── stores/
    └── authStore.ts       # Zustand auth state management
```

## 🔐 Authentication

The app uses JWT-based authentication:

1. **Login**: Email + Password → JWT Token
2. **Registration**: Account creation with interests
3. **Token Storage**: Secure storage using Expo SecureStore
4. **Auto-login**: Bootstrap checks for existing tokens
5. **Token Refresh**: Automatic token refresh on 401 response

## 📊 API Integration

The app integrates with your backend API. Key endpoints used:

### Authentication

- `POST /api/users/register` - Create account
- `POST /api/users/login` - Login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Events

- `GET /api/events/feed` - Get AI-ranked events
- `GET /api/events/:id` - Get event details
- `POST /api/events/create` - Create event
- `POST /api/events/:id/interest` - Mark interest
- `POST /api/events/:id/rate` - Rate event

### Notifications

- `PUT /api/notifications/read/:eventId` - Mark read
- `GET /api/notifications/stats/:eventId` - Get stats
- `GET /api/notifications/insights` - Get AI insights

## 🎨 Theming

The app uses a dark theme with blue accent colors:

- **Background**: `#111827`
- **Cards**: `#1f2937`
- **Primary Color**: `#3b82f6` (Blue)
- **Success**: `#10b981` (Green)
- **Error**: `#ef4444` (Red)
- **Warning**: `#f97316` (Orange)

To customize colors, edit the color codes in individual screen files.

## 📲 Building for Production

### iOS

```bash
# Build for iOS
npm run ios

# Or with EAS (requires account)
eas build --platform ios
```

### Android

```bash
# Build for Android
npm run android

# Or with EAS
eas build --platform android
```

### Distributed Build

Using EAS Build (Expo's cloud build service):

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Update app.json with projectId
# Build for both platforms
eas build --platform all
```

## 🐛 Troubleshooting

### "Cannot find module" errors

```bash
npm install
npm start -- --reset-cache
```

### API connection issues

- Check backend is running on `http://localhost:5000`
- For Android emulator: use `10.0.2.2` instead of `localhost`
- For iOS simulator: use `localhost` or machine IP

### Notification not working

- Ensure Firebase is properly configured
- Check device has notification permissions enabled
- Verify backend has valid FCM credentials

### Build errors

```bash
# Clear cache and reinstall
rm -rf node_modules
rm -rf .expo
npm install
npm start --reset-cache
```

## 🔄 Syncing with Backend

The app is fully integrated with your Express backend. Ensure:

1. Backend is running on the configured API URL
2. CORS is enabled in backend
3. JWT secret matches between frontend and backend
4. Firebase Admin SDK is configured for notifications

## 📝 Development Notes

- All screens handle loading and error states
- API calls include error handling with toast notifications
- State is managed globally with Zustand
- Secure token storage with Expo SecureStore
- Responsive design works on all phone sizes
- Dark mode optimized for battery life

## 🚀 Future Enhancements

- [ ] Offline sync capabilities
- [ ] Real-time chat with event organizers
- [ ] Calendar integration
- [ ] Event check-in with QR codes
- [ ] Dark/Light theme toggle
- [ ] Multi-language support
- [ ] Push notification customization
- [ ] Analytics integration

## 📄 License

This project is part of the university Event Alert and Reminder System.

## 🤝 Support

For issues or questions:

1. Check the troubleshooting section
2. Review the backend API documentation
3. Check Expo documentation: [docs.expo.dev](https://docs.expo.dev)

## 📚 Additional Resources

- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

---

**Happy coding! 🎉**
