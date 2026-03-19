#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE agenty_db;
    \c agenty_db;
    CREATE EXTENSION IF NOT EXISTS vector;
EOSQL
