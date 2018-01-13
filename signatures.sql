DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_profiles;


CREATE TABLE signatures (
    id SERIAL primary key,
    user_id INTEGER,
    signature text NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id serial primary key,
  first varchar(255) NOT NULL,
  last varchar(255) NOT NULL,
  email varchar(255) UNIQUE NOT NULL,
  hashed_pass varchar(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_profiles (
    id SERIAL primary key,
    age INTEGER,
    city VARCHAR(200),
    website VARCHAR(100),
    user_id INTEGER
);
