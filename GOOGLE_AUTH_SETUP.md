# Google Authentication Setup Guide

To enable Google Authentication for your Habit Tracker project, follow these step-by-step instructions.

## 1. Google Cloud Console Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one).
3. Navigate to **APIs & Services > OAuth consent screen**.
4. Choose **External** user type and click **Create**.
5. Fill in the required App information (App name, support email, developer contact).
6. Click **Save and Continue** through the Scopes and Test Users screens.
7. Navigate to **APIs & Services > Credentials**.
8. Click **Create Credentials** and select **OAuth client ID**.
9. Select **Web application** as the application type.
10. Add your Supabase project URL to **Authorized JavaScript origins**:
    *   Example: `https://xyzabc.supabase.co`
11. Add the Supabase callback URL to **Authorized redirect URIs**:
    *   Example: `https://xyzabc.supabase.co/auth/v1/callback`
    *   *Note: You can find your specific callback URL in the Supabase Dashboard under Authentication > Providers > Google.*
12. Click **Create** and copy your **Client ID** and **Client Secret**.

## 2. Supabase Dashboard Configuration

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project and go to **Authentication > Providers**.
3. Find **Google** in the list and click to expand it.
4. Toggle **Enable Google Provider** to ON.
5. Paste your **Google Client ID** and **Google Client Secret** obtained from the Google Cloud Console.
6. Click **Save**.

## 3. Usage in Project

The code is pre-configured with a "Sign in with Google" button. 

### Key Files:
- [AuthContext.tsx](file:///c:/Users/babin/Desktop/NSoC_26/Habit-Tracker/src/contexts/AuthContext.tsx): Configures the `signInWithGoogle` method using Supabase's OAuth API.
- [Auth.tsx](file:///c:/Users/babin/Desktop/NSoC_26/Habit-Tracker/src/components/Auth.tsx): Integrates the login trigger button.

## 4. Redirect URL Configuration

### Local Development:
When running locally, Supabase will automatically handle the redirect back to `http://localhost:5173` (or your configured Vite development port) as long as it's configured in your Supabase Auth settings as an allowed redirect URL.

1. In Supabase, go to **Authentication > URL Configuration**.
2. Ensure `http://localhost:5173` is added in the **Site URL** or **Redirect URLs** list.

### Staging & Production Deployment (e.g. Netlify):
If you deploy your app to Netlify (e.g. `https://habittracker-c.netlify.app/`), you **must** register this production domain in your Supabase project configurations:

1. Go to **Authentication > URL Configuration**.
2. Add your Netlify URL (e.g., `https://your-app.netlify.app`) to the **Redirect URLs** list.

> [!IMPORTANT]
> If you omit the redirect configurations in your Supabase project, authentication redirects will default back to the localhost site, blocking production user sign-ins.

---
**Note:** The project features a database trigger (`on_auth_user_created`) that automatically inserts a new profile row in the `profiles` schema table when users sign in with Google OAuth for the first time. No additional database configuration is required!
