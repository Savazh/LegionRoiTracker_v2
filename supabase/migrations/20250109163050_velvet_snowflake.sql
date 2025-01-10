/*
  # Social Features Schema

  1. New Tables
    - `comments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `token_id` (text, not null)
      - `content` (text, not null)
      - `created_at` (timestamp with time zone)
      - `votes` (integer)
    
    - `price_predictions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `token_id` (text, not null)
      - `predicted_price` (numeric, not null)
      - `target_date` (timestamp with time zone)
      - `created_at` (timestamp with time zone)
      - `votes` (integer)

  2. Security
    - Enable RLS on both tables
    - Add policies for:
      - Anyone can read comments and predictions
      - Only authenticated users can create comments and predictions
      - Only comment/prediction owners can update their own entries
*/

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  token_id text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  votes integer DEFAULT 0,
  CONSTRAINT content_length CHECK (char_length(content) <= 1000)
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Price predictions table
CREATE TABLE IF NOT EXISTS price_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  token_id text NOT NULL,
  predicted_price numeric NOT NULL,
  target_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  votes integer DEFAULT 0,
  CONSTRAINT positive_price CHECK (predicted_price > 0)
);

ALTER TABLE price_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read predictions"
  ON price_predictions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create predictions"
  ON price_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own predictions"
  ON price_predictions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS comments_token_id_idx ON comments(token_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS predictions_token_id_idx ON price_predictions(token_id);
CREATE INDEX IF NOT EXISTS predictions_created_at_idx ON price_predictions(created_at DESC);