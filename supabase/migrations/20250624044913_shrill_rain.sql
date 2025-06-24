/*
  # Add DELETE policy for conflicts table

  1. Security Policy
    - Add policy "Users can delete their own conflicts" to conflicts table
    - Allow DELETE operations for authenticated users
    - Only allow deletion if auth.uid() matches user1_id (conflict creator)

  2. Changes
    - Users can now delete conflicts they created
    - Only the original conflict creator (user1) can delete the conflict
    - User2 cannot delete conflicts they didn't create
*/

-- Add DELETE policy for conflicts table
CREATE POLICY "Users can delete their own conflicts"
  ON conflicts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user1_id);