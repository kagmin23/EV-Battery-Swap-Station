# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Auth & Navigation Structure (Customized)

The app now starts at the login screen by default. Authentication state is managed via a lightweight context with AsyncStorage-backed token persistence (placeholder implementation).

Key behaviors:

- Unauthenticated: Only auth screens (`/auth/login`, `/auth/register`, `/auth/forgot-password`) are mounted.
- Authenticated: Tab navigator (`/(tabs)`) is mounted; auth screens unmounted.
- Root path (`/`) redirects dynamically based on auth state.
- Simple email/password form triggers `login()` and redirects to `/(tabs)`.

Important files:

| File | Role |
|------|------|
| `app/_layout.tsx` | Wraps the app with `AuthProvider` and conditionally renders stacks. |
| `app/index.tsx` | Redirect logic for initial load. |
| `features/auth/context/AuthContext.tsx` | Auth context + login/logout/restore methods. |
| `app/auth/login.tsx` | Enhanced login UI with email/password form. |
| `app/auth/register.tsx` | Placeholder register screen. |
| `app/auth/forgot-password.tsx` | Placeholder forgot password screen. |

Planned next improvements (optional):

1. Replace fake login with real API and error handling.
2. Add splash/loading component while restoring session.
3. Implement register & password reset flows.
4. Add role-based access control for tabs (driver/admin/staff).
5. Centralize API layer + token refresh logic.

