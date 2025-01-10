/*
  # Update schema for nickname-based comments and predictions

  1. Changes
    - Remove user_id foreign key constraints
    - Add nickname field to both tables
    - Update RLS policies to allow public access

  2. Tables
    - comments
      - id (uuid, primary key)
      - nickname (text)
      - token_id (text)
      - content (text)
      - created_at (timestamptz)
      - votes (integer)
    
    - price_predictions
      - id (uuid, primary key)
      - nickname (text)
      - token_id (text)
      - predicted_price (numeric)
      - target_date (timestamptz)
      - created_at (timestamptz)
      - votes (integer)
*/

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
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
CREATE TABLE IF NOT EXISTS price_predictions (
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
CREATE INDEX IF NOT EXISTS comments_token_id_idx ON comments(token_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS predictions_token_id_idx ON price_predictions(token_id);
CREATE INDEX IF NOT EXISTS predictions_created_at_idx ON price_predictions(created_at DESC);