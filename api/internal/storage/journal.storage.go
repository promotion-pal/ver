package storage

import (
	"context"
	"errors"
	"log/slog"

	"gorm.io/gorm"

	"dvgmu/ver/internal/domain/models"
)

// JournalStorage — хранилище журналов сотрудников.
type JournalStorage struct {
	db  *gorm.DB
	log *slog.Logger
}

func JournalStorageNew(db *gorm.DB, log *slog.Logger) *JournalStorage {
	return &JournalStorage{db: db, log: log}
}

func (s *JournalStorage) Create(ctx context.Context, journal *models.Journal) (int64, error) {
	if err := s.db.WithContext(ctx).Create(journal).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return 0, models.ErrSlugTaken
		}
		s.log.Error("failed to create journal", "error", err.Error())
		return 0, err
	}
	return journal.ID, nil
}

func (s *JournalStorage) List(ctx context.Context) ([]models.Journal, error) {
	var journals []models.Journal
	if err := s.db.WithContext(ctx).Order("id").Find(&journals).Error; err != nil {
		s.log.Error("failed to list journals", "error", err.Error())
		return nil, err
	}
	return journals, nil
}

func (s *JournalStorage) BySlug(ctx context.Context, slug string) (*models.Journal, error) {
	var journal models.Journal
	if err := s.db.WithContext(ctx).Where("slug = ?", slug).First(&journal).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		s.log.Error("failed to fetch journal by slug", "slug", slug, "error", err.Error())
		return nil, err
	}
	return &journal, nil
}
