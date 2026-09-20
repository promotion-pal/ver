-- Версия 00002: 00001 занимала миграция заявок (Ticket), уже применённая на существующих БД.
-- Таблицы заявок здесь намеренно не удаляются.
-- +goose Up
CREATE TABLE journal (
    id BIGSERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    employee TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE work_entry (
    id BIGSERIAL PRIMARY KEY,
    journal_id BIGINT NOT NULL REFERENCES journal (id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    site_slug TEXT NOT NULL DEFAULT '',
    category INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    steps JSONB NOT NULL DEFAULT '[]',
    result TEXT NOT NULL DEFAULT '',
    hours DOUBLE PRECISION NOT NULL CHECK (hours > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_work_entry_journal_date ON work_entry (journal_id, entry_date);
CREATE INDEX idx_work_entry_date ON work_entry (entry_date);

-- +goose Down
DROP TABLE work_entry;
DROP TABLE journal;
