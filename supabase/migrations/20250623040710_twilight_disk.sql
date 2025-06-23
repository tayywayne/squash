/*
  # Add final_judgment status to conflict_status enum

  1. Changes
    - Add 'final_judgment' to the conflict_status enum type
    - This allows conflicts to be marked as final_judgment instead of resolved
    - Final judgment conflicts will appear in "My Squashes" but not in active conflicts

  2. Security
    - No RLS changes needed as this is just adding an enum value
*/

-- Add final_judgment to the conflict_status enum
ALTER TYPE conflict_status ADD VALUE 'final_judgment';