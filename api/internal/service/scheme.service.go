package service

import (
	"context"
	"fmt"

	"dvgmu/ver/internal/domain/models"
	"dvgmu/ver/internal/storage"
)

type SchemeStageService struct {
	storage *storage.SchemeStageStorage
}

func NewSchemeStageService(storage *storage.SchemeStageStorage) *SchemeStageService {
	return &SchemeStageService{storage: storage}
}

func (s *SchemeStageService) Create(ctx context.Context, stage *models.SchemeStage) (int64, error) {
	id, err := s.storage.Create(ctx, stage)
	if err != nil {
		return 0, fmt.Errorf("create scheme stage: %w", err)
	}
	return id, nil
}

func (s *SchemeStageService) Fetch(ctx context.Context, filter models.SchemeStageFilter) ([]models.SchemeStage, error) {
	stages, err := s.storage.Fetch(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("fetch scheme stages: %w", err)
	}
	return stages, nil
}

func (s *SchemeStageService) Update(ctx context.Context, stage *models.SchemeStage) error {
	if err := s.storage.Update(ctx, stage); err != nil {
		return fmt.Errorf("update scheme stage: %w", err)
	}
	return nil
}

func (s *SchemeStageService) Delete(ctx context.Context, id int64) error {
	if err := s.storage.Delete(ctx, id); err != nil {
		return fmt.Errorf("delete scheme stage: %w", err)
	}
	return nil
}
