package storage

import (
	"context"
	"errors"
	"log/slog"

	"gorm.io/gorm"

	"dvgmu/ver/internal/domain/models"
)

func applyWorkEntryFilter(query *gorm.DB, filter models.WorkEntryFilter) *gorm.DB {
	if filter.JournalID != nil {
		query = query.Where("journal_id = ?", *filter.JournalID)
	}
	if filter.FromDate != nil {
		query = query.Where("entry_date >= ?", *filter.FromDate)
	}
	if filter.ToDate != nil {
		query = query.Where("entry_date <= ?", *filter.ToDate)
	}
	if filter.SiteSlug != nil {
		query = query.Where("site_slug = ?", *filter.SiteSlug)
	}
	if filter.Category != nil {
		query = query.Where("category = ?", *filter.Category)
	}
	return query
}

// WorkEntryStorage — хранилище записей о выполненной работе.
type WorkEntryStorage struct {
	db  *gorm.DB
	log *slog.Logger
}

func WorkEntryStorageNew(db *gorm.DB, log *slog.Logger) *WorkEntryStorage {
	return &WorkEntryStorage{db: db, log: log}
}

func (s *WorkEntryStorage) Create(ctx context.Context, entry *models.WorkEntry) (int64, error) {
	if err := s.db.WithContext(ctx).Create(entry).Error; err != nil {
		if errors.Is(err, gorm.ErrForeignKeyViolated) {
			return 0, models.ErrJournalNotFound
		}
		s.log.Error("failed to create work entry", "error", err.Error())
		return 0, err
	}
	return entry.ID, nil
}

func (s *WorkEntryStorage) Fetch(ctx context.Context, filter models.WorkEntryFilter) ([]models.WorkEntry, error) {
	query := applyWorkEntryFilter(s.db.WithContext(ctx).Order("entry_date, id"), filter)

	var entries []models.WorkEntry
	if err := query.Find(&entries).Error; err != nil {
		s.log.Error("failed to fetch work entries", "error", err.Error())
		return nil, err
	}
	return entries, nil
}

// Update заменяет содержимое записи; journal_id не меняется.
func (s *WorkEntryStorage) Update(ctx context.Context, entry *models.WorkEntry) error {
	res := s.db.WithContext(ctx).Model(&models.WorkEntry{}).Where("id = ?", entry.ID).Updates(map[string]any{
		"entry_date": entry.EntryDate,
		"site_slug":  entry.SiteSlug,
		"category":   entry.Category,
		"title":      entry.Title,
		"details":    entry.Details,
		"steps":      entry.Steps,
		"result":     entry.Result,
		"hours":      entry.Hours,
	})
	if res.Error != nil {
		s.log.Error("failed to update work entry", "id", entry.ID, "error", res.Error.Error())
		return res.Error
	}
	if res.RowsAffected == 0 {
		return models.ErrEntryNotFound
	}
	return nil
}

func (s *WorkEntryStorage) Delete(ctx context.Context, id int64) error {
	res := s.db.WithContext(ctx).Delete(&models.WorkEntry{}, id)
	if res.Error != nil {
		s.log.Error("failed to delete work entry", "id", id, "error", res.Error.Error())
		return res.Error
	}
	if res.RowsAffected == 0 {
		return models.ErrEntryNotFound
	}
	return nil
}
