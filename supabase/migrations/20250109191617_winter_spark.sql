/*
  # Update schema for nickname-based system

  1. Changes
    - Drop existing tables to remove user_id dependency
    - Recreate tables with nickname field
    - Add appropriate constraints and policies
    - Create necessary indexes
*/

-- Drop existing tables
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS price_predictions CASCADE;

-- Comments table
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text NOT NULL,
  token_id text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  votes integer DEFAULT 0,
  CONSTRAINT content_length CHECK (char_length(content) <= 1000),
  CONSTRAINT nickname_length CHECK (char_length(nickname) <= 50)
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access"
  ON comments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON comments
  FOR UPDATE
  TO public
  USING (true);

-- Price predictions table
CREATE TABLE price_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname text NOT NULL,
  token_id text NOT NULL,
  predicted_price numeric NOT NULL,
  target_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  votes integer DEFAULT 0,
  CONSTRAINT positive_price CHECK (predicted_price > 0),
  CONSTRAINT nickname_length CHECK (char_length(nickname) <= 50)
);

ALTER TABLE price_predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON price_predictions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access"
  ON price_predictions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON price_predictions
  FOR UPDATE
  TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX comments_token_id_idx ON comments(token_id);
CREATE INDEX comments_created_at_idx ON comments(created_at DESC);
CREATE INDEX predictions_token_id_idx ON price_predictions(token_id);
CREATE INDEX predictions_created_at_idx ON price_predictions(created_at DESC);