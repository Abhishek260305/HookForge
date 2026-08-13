-- +goose Up
CREATE TABLE IF NOT EXISTS control.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    environment TEXT NOT NULL DEFAULT 'dev',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS projects_created_at_idx ON control.projects (created_at DESC);

-- +goose Down
DROP TABLE IF EXISTS control.projects;
