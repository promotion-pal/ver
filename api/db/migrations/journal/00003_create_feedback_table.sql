-- +goose Up
CREATE TABLE feedback (
    id BIGSERIAL PRIMARY KEY,
    site_slug TEXT NOT NULL,
    site_name TEXT NOT NULL DEFAULT '',
    version_id TEXT NOT NULL,
    version_label TEXT NOT NULL DEFAULT '',
    author_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    action INTEGER NOT NULL,
    comment TEXT NOT NULL,
    status INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedback_site_version ON feedback (site_slug, version_id);

-- +goose Down
DROP TABLE feedback;
