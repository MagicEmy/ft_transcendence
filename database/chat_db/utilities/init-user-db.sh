#!/bin/bash
set -e

# seting up the SCRAM-SHA-256 authentication for the PostgreSQL database
# this ensures that a password is always required to log into the database
sed -i 's/#password_encryption = scram-sha-256/password_encryption = scram-sha-256/' /var/lib/postgresql/data/postgresql.conf
sed -i 's/            trust/            scram-sha-256/g' /var/lib/postgresql/data/pg_hba.conf

# reload the configuration files so that the change becomes effective
pg_ctl reload -D /var/lib/postgresql/data

# create a user with required privileges for the database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL

	CREATE USER $POSTGRES_USER_CHAT WITH PASSWORD '$POSTGRES_PASSWORD_CHAT';

	GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER_CHAT;
	GRANT ALL ON SCHEMA public TO $POSTGRES_USER_CHAT;

EOSQL
