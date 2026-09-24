package storage

import (
	"context"
	"log/slog"

	"gorm.io/gorm"

	"dvgmu/ver/internal/domain/models"
)

// SchemeStageStorage — хранилище этапов плана работ по схемам проектов.
type SchemeStageStorage struct {
	db  *gorm.DB
	log *slog.Logger
}

func SchemeStageStorageNew(db *gorm.DB, log *slog.Logger) *SchemeStageStorage {
	return &SchemeStageStorage{db: db, log: log}
}

func (s *SchemeStageStorage) Create(ctx context.Context, stage *models.SchemeStage) (int64, error) {
	if err := s.db.WithContext(ctx).Create(stage).Error; err != nil {
		s.log.Error("failed to create scheme stage", "error", err.Error())
		return 0, err
	}
	return stage.ID, nil
}

// Fetch возвращает этапы по сроку; этапы без срока — в конце.
func (s *SchemeStageStorage) Fetch(ctx context.Context, filter models.SchemeStageFilter) ([]models.SchemeStage, error) {
	query := s.db.WithContext(ctx).
		Where("site_slug = ?", filter.SiteSlug).
		Order("due_date NULLS LAST, id")
	if filter.SchemeID != nil {
		query = query.Where("scheme_id = ?", *filter.SchemeID)
	}

	var stages []models.SchemeStage
	if err := query.Find(&stages).Error; err != nil {
		s.log.Error("failed to fetch scheme stages", "error", err.Error())
		return nil, err
	}
	return stages, nil
}

// Update заменяет содержимое этапа; проект и схема не меняются.
func (s *SchemeStageStorage) Update(ctx context.Context, stage *models.SchemeStage) error {
	res := s.db.WithContext(ctx).Model(&models.SchemeStage{}).Where("id = ?", stage.ID).Updates(map[string]any{
		"title":      stage.Title,
		"details":    stage.Details,
		"start_date": stage.StartDate,
		"due_date":   stage.DueDate,
		"status":     stage.Status,
	})
	if res.Error != nil {
		s.log.Error("failed to update scheme stage", "id", stage.ID, "error", res.Error.Error())
		return res.Error
	}
	if res.RowsAffected == 0 {
		return models.ErrSchemeStageNotFound
	}
	return nil
}

func (s *SchemeStageStorage) Delete(ctx context.Context, id int64) error {
	res := s.db.WithContext(ctx).Delete(&models.SchemeStage{}, id)
	if res.Error != nil {
		s.log.Error("failed to delete scheme stage", "id", id, "error", res.Error.Error())
		return res.Error
	}
	if res.RowsAffected == 0 {
		return models.ErrSchemeStageNotFound
	}
	return nil
}
