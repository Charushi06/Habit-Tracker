# Google Authentication Setup Guide

To enable Google Authentication for your Habit Tracker project, follow these step-by-step instructions.

## 1. Google Cloud Console Configuration

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (or select an existing one).
3.  Navigate to **APIs & Services > OAuth consent screen**.
4.  Choose **External** user type and click **Create**.
5.  Fill in the required App information (App name, support email, developer contact).
6.  Click **Save and Continue** through the Scopes and Test Users screens.
7.  Navigate to **APIs & Services > Credentials**.
8.  Click **Create Credentials** and select **OAuth client ID**.
9.  Select **Web application** as the application type.
10. Add your Supabase project URL to **Authorized JavaScript origins**:
    *   Example: `https://xyzabc.supabase.co`
11. Add the Supabase callback URL to **Authorized redirect URIs**:
    *   Example: `https://xyzabc.supabase.co/auth/v1/callback`
    *   *Note: You can find your specific callback URL in the Supabase Dashboard under Authentication > Providers > Google.*
12. Click **Create** and copy your **Client ID** and **Client Secret**.

## 2. Supabase Dashboard Configuration

1.  Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project and go to **Authentication > Providers**.
3.  Find **Google** in the list and click to expand it.
4.  Toggle **Enable Google Provider** to ON.
5.  Paste your **Google Client ID** and **Google Client Secret** obtained from the Google Cloud Console.
6.  Click **Save**.

## 3. Usage in Project

The code has already been updated to include a "Sign in with Google" button. 

### Key Files Modified:
- `src/contexts/AuthContext.tsx`: Added `signInWithGoogle` method using Supabase's OAuth.
- `src/components/Auth.tsx`: Added the Google login button and divider.

### Local Development:
When running locally, Supabase will automatically handle the redirect back to `http://localhost:5173` (or whatever port you are using) as long as it's configured in your Supabase Auth settings as an allowed redirect URL.

1.  In Supabase, go to **Authentication > URL Configuration**.
2.  Ensure `http://localhost:5173` (or your local URL) is in the **Site URL** or **Redirect URLs** list.

---
**Note:** The project already has a database trigger (`on_auth_user_created`) that automatically creates a user profile in the `profiles` table when someone signs in with Google for the first time. No additional database changes are needed!
