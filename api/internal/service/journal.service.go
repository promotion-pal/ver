package service

import (
	"context"
	"fmt"

	"dvgmu/ver/internal/domain/models"
	"dvgmu/ver/internal/storage"
)

type JournalService struct {
	storage *storage.JournalStorage
}

func NewJournalService(storage *storage.JournalStorage) *JournalService {
	return &JournalService{storage: storage}
}

func (s *JournalService) Create(ctx context.Context, journal *models.Journal) (int64, error) {
	id, err := s.storage.Create(ctx, journal)
	if err != nil {
		return 0, fmt.Errorf("create journal: %w", err)
	}
	return id, nil
}

func (s *JournalService) List(ctx context.Context) ([]models.Journal, error) {
	journals, err := s.storage.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("list journals: %w", err)
	}
	return journals, nil
}

func (s *JournalService) BySlug(ctx context.Context, slug string) (*models.Journal, error) {
	journal, err := s.storage.BySlug(ctx, slug)
	if err != nil {
		return nil, fmt.Errorf("get journal: %w", err)
	}
	return journal, nil
}
