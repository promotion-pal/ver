package service

import (
	"context"
	"fmt"

	"dvgmu/tickets/internal/domain/models"
	"dvgmu/tickets/internal/storage"
)

type TicketDormitoryService struct {
	storage *storage.TicketDormitoryStorage
}

func NewTicketDormitoryService(storage *storage.TicketDormitoryStorage) *TicketDormitoryService {
	return &TicketDormitoryService{storage: storage}
}

func (s *TicketDormitoryService) Create(ctx context.Context, ticket *models.TicketDormitory) (int64, error) {
	id, err := s.storage.Create(ctx, ticket)
	if err != nil {
		return 0, fmt.Errorf("create dormitory ticket: %w", err)
	}
	return id, nil
}

func (s *TicketDormitoryService) ByID(ctx context.Context, id int64) (*models.TicketDormitory, error) {
	ticket, err := s.storage.ByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get dormitory ticket: %w", err)
	}
	return ticket, nil
}

func (s *TicketDormitoryService) Fetch(ctx context.Context, filter models.TicketFilter) ([]models.TicketDormitory, error) {
	tickets, err := s.storage.Fetch(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("fetch dormitory tickets: %w", err)
	}
	return tickets, nil
}

func (s *TicketDormitoryService) ChangeStatus(ctx context.Context, id int64, status int32) error {
	if err := s.storage.UpdateStatus(ctx, id, status); err != nil {
		return fmt.Errorf("change dormitory ticket status: %w", err)
	}
	return nil
}

type TicketBuildService struct {
	storage *storage.TicketBuildStorage
}

func NewTicketBuildService(storage *storage.TicketBuildStorage) *TicketBuildService {
	return &TicketBuildService{storage: storage}
}

func (s *TicketBuildService) Create(ctx context.Context, ticket *models.TicketBuild) (int64, error) {
	id, err := s.storage.Create(ctx, ticket)
	if err != nil {
		return 0, fmt.Errorf("create build ticket: %w", err)
	}
	return id, nil
}

func (s *TicketBuildService) ByID(ctx context.Context, id int64) (*models.TicketBuild, error) {
	ticket, err := s.storage.ByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get build ticket: %w", err)
	}
	return ticket, nil
}

func (s *TicketBuildService) Fetch(ctx context.Context, filter models.TicketFilter) ([]models.TicketBuild, error) {
	tickets, err := s.storage.Fetch(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("fetch build tickets: %w", err)
	}
	return tickets, nil
}

func (s *TicketBuildService) ChangeStatus(ctx context.Context, id int64, status int32) error {
	if err := s.storage.UpdateStatus(ctx, id, status); err != nil {
		return fmt.Errorf("change build ticket status: %w", err)
	}
	return nil
}
