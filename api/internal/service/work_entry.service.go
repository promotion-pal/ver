package service

import (
	"context"
	"fmt"

	"dvgmu/ver/internal/domain/models"
	"dvgmu/ver/internal/storage"
)

type WorkEntryService struct {
	storage *storage.WorkEntryStorage
}

func NewWorkEntryService(storage *storage.WorkEntryStorage) *WorkEntryService {
	return &WorkEntryService{storage: storage}
}

func (s *WorkEntryService) Create(ctx context.Context, entry *models.WorkEntry) (int64, error) {
	id, err := s.storage.Create(ctx, entry)
	if err != nil {
		return 0, fmt.Errorf("create work entry: %w", err)
	}
	return id, nil
}

func (s *WorkEntryService) Fetch(ctx context.Context, filter models.WorkEntryFilter) ([]models.WorkEntry, error) {
	entries, err := s.storage.Fetch(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("fetch work entries: %w", err)
	}
	return entries, nil
}

func (s *WorkEntryService) Update(ctx context.Context, entry *models.WorkEntry) error {
	if err := s.storage.Update(ctx, entry); err != nil {
		return fmt.Errorf("update work entry: %w", err)
	}
	return nil
}

func (s *WorkEntryService) Delete(ctx context.Context, id int64) error {
	if err := s.storage.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete work entry: %w", err)
	}
	return nil
}
