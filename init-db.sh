#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE brainia_db;
    \c brainia_db;
    CREATE EXTENSION IF NOT EXISTS vector;
EOSQL
