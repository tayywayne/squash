/*
  # Update conflicts RLS policy for user2 initial response

  1. Changes
    - Drop existing update policy for conflicts table
    - Create new update policy that allows user2 to respond initially
    - The new policy allows updates when:
      - User is user1 (user1_id matches auth.uid())
      - User is user2 and already linked (user2_id matches auth.uid())
      - User is user2 making initial response (email matches user2_email AND user2_id is NULL)

  2. Security
    - Maintains security by only allowing legitimate participants to update conflicts
    - Enables user2 to make their initial response and get linked to the conflict
*/

-- Drop the existing update policy
DROP POLICY IF EXISTS "Users can update conflicts they're involved in" ON conflicts;

-- Create new update policy with support for user2 initial response
CREATE POLICY "Users can update conflicts they're involved in"
  ON conflicts
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user1_id OR 
    auth.uid() = user2_id OR
    (auth.email() = user2_email AND user2_id IS NULL)
  );