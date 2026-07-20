-- Custom SQL migration file, put your code below! --

-- Seed creator categories (idempotent).
INSERT INTO "category" ("name") VALUES
  ('Streamer'),
  ('Musician'),
  ('Artist'),
  ('Writer'),
  ('Podcaster'),
  ('Video creator'),
  ('Comedian'),
  ('Photographer'),
  ('Software Engineer'),
  ('Designer'),
  ('Educator'),
  ('Other')
ON CONFLICT ("name") DO NOTHING;
