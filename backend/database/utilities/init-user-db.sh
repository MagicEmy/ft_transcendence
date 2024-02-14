#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL

	CREATE USER $POSTGRES_USER_AUTH WITH PASSWORD '$POSTGRES_PASSWORD_AUTH';
	GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER_AUTH;
	GRANT ALL ON SCHEMA public TO $POSTGRES_USER_AUTH;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER_AUTH" --dbname "$POSTGRES_DB" <<-EOSQL

	CREATE TABLE IF NOT EXISTS users (
		user_id		VARCHAR (128) PRIMARY KEY UNIQUE NOT NULL,
		user_name	VARCHAR (50) UNIQUE NOT NULL,
		email		VARCHAR (128) UNIQUE NOT NULL,
		avatar_path	TEXT NOT NULL DEFAULT '/images/default.jpg'
	);

	CREATE TABLE IF NOT EXISTS users_auth (
		user_id			VARCHAR (128) REFERENCES users(user_id),
		intra_login		VARCHAR (10),
		is_2FA_enabled	BOOLEAN,
		CONSTRAINT fk_user_id
			FOREIGN KEY(user_id) 
				REFERENCES users(user_id)
	);

	CREATE TABLE IF NOT EXISTS achievements (
		achievement_id			VARCHAR (128) PRIMARY KEY UNIQUE NOT NULL,
		achievement_name		VARCHAR (128),
		achievement_description	TEXT
	);
	
	CREATE TABLE IF NOT EXISTS users_achievements (
		user_id			VARCHAR (128) REFERENCES users(user_id),
		achievement_id	VARCHAR (128) REFERENCES achievements(achievement_id)
	);
	
	CREATE TABLE IF NOT EXISTS users_relationships (
		user_id				VARCHAR (128) REFERENCES users(user_id),
		counterpart_id		VARCHAR (128) REFERENCES users(user_id),
		relationship_type	INT
	);
	
	CREATE TABLE IF NOT EXISTS games (
		game_id		VARCHAR (128) PRIMARY KEY,
		game_type	INT   
	);

	CREATE TABLE IF NOT EXISTS games_single (
		game_id	VARCHAR (128) REFERENCES games(game_id),
		player	VARCHAR (128) REFERENCES users(user_id),
		score	INT DEFAULT 0
	);

	CREATE TABLE IF NOT EXISTS games_double (
	game_id			VARCHAR (128) REFERENCES games(game_id),
	left_player		VARCHAR (128) REFERENCES users(user_id),
	right_player	VARCHAR (128) REFERENCES users(user_id),
	left_score		INT DEFAULT 0,
	right_score		INT DEFAULT 0
	);
EOSQL