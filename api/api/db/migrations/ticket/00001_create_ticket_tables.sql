-- +goose Up
CREATE TABLE ticket_dormitory (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    room INTEGER NOT NULL DEFAULT 0,
    location INTEGER NOT NULL DEFAULT 0,
    comment TEXT NOT NULL DEFAULT '',
    type INTEGER NOT NULL DEFAULT 0,
    status INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_dormitory_user_id ON ticket_dormitory (user_id);

CREATE TABLE ticket_build (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    room INTEGER NOT NULL DEFAULT 0,
    location INTEGER NOT NULL DEFAULT 0,
    comment TEXT NOT NULL DEFAULT '',
    type INTEGER NOT NULL DEFAULT 0,
    status INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_build_user_id ON ticket_build (user_id);

-- +goose Down
DROP TABLE ticket_build;
DROP TABLE ticket_dormitory;
