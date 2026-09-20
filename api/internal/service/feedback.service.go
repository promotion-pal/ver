package service

import (
	"context"
	"fmt"

	"dvgmu/ver/internal/domain/models"
	"dvgmu/ver/internal/storage"
)

type FeedbackService struct {
	storage *storage.FeedbackStorage
}

func NewFeedbackService(storage *storage.FeedbackStorage) *FeedbackService {
	return &FeedbackService{storage: storage}
}

func (s *FeedbackService) Create(ctx context.Context, feedback *models.Feedback) (int64, error) {
	id, err := s.storage.Create(ctx, feedback)
	if err != nil {
		return 0, fmt.Errorf("create feedback: %w", err)
	}
	return id, nil
}

func (s *FeedbackService) Fetch(ctx context.Context, filter models.FeedbackFilter) ([]models.Feedback, error) {
	feedbacks, err := s.storage.Fetch(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("fetch feedback: %w", err)
	}
	return feedbacks, nil
}

func (s *FeedbackService) ChangeStatus(ctx context.Context, id int64, status int32) error {
	if err := s.storage.UpdateStatus(ctx, id, status); err != nil {
		return fmt.Errorf("change feedback status: %w", err)
	}
	return nil
}
