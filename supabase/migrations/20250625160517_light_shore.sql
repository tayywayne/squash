/*
  # Add onboarding_complete field to profiles table

  1. Changes
    - Add `onboarding_complete` (boolean, default false) to track if user has completed onboarding
    - This allows us to show the onboarding flow only to new users

  2. Security
    - No RLS changes needed as this is an additional field on existing table
*/

-- Add onboarding_complete field to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_complete'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_complete boolean DEFAULT false;
  END IF;
END $$;