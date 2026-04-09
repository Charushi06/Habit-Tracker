/*
  # Categories Management Schema

  ## Overview
  Adds a categories table for user-defined habit categories with full CRUD support
  and Row Level Security.

  ## New Tables

  ### 1. `categories`
  User-defined categories for organizing habits
  - `id` (uuid, primary key) - Unique category identifier
  - `user_id` (uuid, foreign key) - References profiles(id)
  - `name` (text) - Category name
  - `created_at` (timestamptz) - Category creation timestamp

  ## Security

  ### Row Level Security (RLS)
  - Users can only access their own categories
  - All operations (SELECT, INSERT, UPDATE, DELETE) require authentication
  - Policies enforce user_id matching for complete data isolation

  ### Constraints
  - Unique constraint on (user_id, name) prevents duplicate category names per user
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
