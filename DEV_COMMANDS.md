# Start Docker Container with Postgres

docker start fitness-postgres

# Stop Docker Container

docker stop fitness-postgres

# Create Account Table Command

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,

    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_secret TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

# Enter into psql cli

docker exec -it fitness-postgres psql -U postgres -d fitness_db


