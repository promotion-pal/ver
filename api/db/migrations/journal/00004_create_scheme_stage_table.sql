-- +goose Up
CREATE TABLE scheme_stage (
    id BIGSERIAL PRIMARY KEY,
    site_slug TEXT NOT NULL,
    scheme_id TEXT NOT NULL,
    title TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    start_date DATE,
    due_date DATE,
    status INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheme_stage_site_scheme ON scheme_stage (site_slug, scheme_id);

-- +goose Down
DROP TABLE scheme_stage;
