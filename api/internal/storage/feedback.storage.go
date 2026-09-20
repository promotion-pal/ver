package storage

import (
	"context"
	"log/slog"

	"gorm.io/gorm"

	"dvgmu/ver/internal/domain/models"
)

// FeedbackStorage — хранилище обратной связи заказчиков по сайтам.
type FeedbackStorage struct {
	db  *gorm.DB
	log *slog.Logger
}

func FeedbackStorageNew(db *gorm.DB, log *slog.Logger) *FeedbackStorage {
	return &FeedbackStorage{db: db, log: log}
}

func (s *FeedbackStorage) Create(ctx context.Context, feedback *models.Feedback) (int64, error) {
	if err := s.db.WithContext(ctx).Create(feedback).Error; err != nil {
		s.log.Error("failed to create feedback", "error", err.Error())
		return 0, err
	}
	return feedback.ID, nil
}

// Fetch возвращает отзывы, новые — первыми.
func (s *FeedbackStorage) Fetch(ctx context.Context, filter models.FeedbackFilter) ([]models.Feedback, error) {
	query := s.db.WithContext(ctx).Order("id DESC")
	if filter.SiteSlug != nil {
		query = query.Where("site_slug = ?", *filter.SiteSlug)
	}
	if filter.VersionID != nil {
		query = query.Where("version_id = ?", *filter.VersionID)
	}
	if filter.Status != nil {
		query = query.Where("status = ?", *filter.Status)
	}

	var feedbacks []models.Feedback
	if err := query.Find(&feedbacks).Error; err != nil {
		s.log.Error("failed to fetch feedback", "error", err.Error())
		return nil, err
	}
	return feedbacks, nil
}

func (s *FeedbackStorage) UpdateStatus(ctx context.Context, id int64, status int32) error {
	res := s.db.WithContext(ctx).Model(&models.Feedback{}).Where("id = ?", id).Update("status", status)
	if res.Error != nil {
		s.log.Error("failed to update feedback status", "id", id, "error", res.Error.Error())
		return res.Error
	}
	if res.RowsAffected == 0 {
		return models.ErrFeedbackNotFound
	}
	return nil
}
