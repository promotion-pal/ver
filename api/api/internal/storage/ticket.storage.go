package storage

import (
	"context"
	"errors"
	"log/slog"

	"gorm.io/gorm"

	"dvgmu/tickets/internal/domain/models"
)

// applyTicketFilter накладывает общие фильтры истории заявок на запрос.
func applyTicketFilter(query *gorm.DB, filter models.TicketFilter) *gorm.DB {
	if filter.UserID != nil {
		query = query.Where("user_id = ?", *filter.UserID)
	}
	if filter.Room != nil {
		query = query.Where("room = ?", *filter.Room)
	}
	if filter.Location != nil {
		query = query.Where("location = ?", *filter.Location)
	}
	if filter.Type != nil {
		query = query.Where("type = ?", *filter.Type)
	}
	if filter.Status != nil {
		query = query.Where("status = ?", *filter.Status)
	}
	if filter.StartDate != nil {
		query = query.Where("created_at >= ?", *filter.StartDate)
	}
	if filter.EndDate != nil {
		query = query.Where("created_at <= ?", *filter.EndDate)
	}
	return query
}

// TicketDormitoryStorage — хранилище заявок по общежитиям.
type TicketDormitoryStorage struct {
	db  *gorm.DB
	log *slog.Logger
}

func TicketDormitoryStorageNew(db *gorm.DB, log *slog.Logger) *TicketDormitoryStorage {
	return &TicketDormitoryStorage{db: db, log: log}
}

func (s *TicketDormitoryStorage) Create(ctx context.Context, ticket *models.TicketDormitory) (int64, error) {
	if err := s.db.WithContext(ctx).Create(ticket).Error; err != nil {
		s.log.Error("failed to create dormitory ticket", "error", err.Error())
		return 0, err
	}
	return ticket.ID, nil
}

func (s *TicketDormitoryStorage) ByID(ctx context.Context, id int64) (*models.TicketDormitory, error) {
	var ticket models.TicketDormitory
	if err := s.db.WithContext(ctx).First(&ticket, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		s.log.Error("failed to fetch dormitory ticket by id", "id", id, "error", err.Error())
		return nil, err
	}
	return &ticket, nil
}

func (s *TicketDormitoryStorage) Fetch(ctx context.Context, filter models.TicketFilter) ([]models.TicketDormitory, error) {
	query := applyTicketFilter(s.db.WithContext(ctx).Order("id"), filter)

	var tickets []models.TicketDormitory
	if err := query.Find(&tickets).Error; err != nil {
		s.log.Error("failed to fetch dormitory tickets", "error", err.Error())
		return nil, err
	}
	return tickets, nil
}

func (s *TicketDormitoryStorage) UpdateStatus(ctx context.Context, id int64, status int32) error {
	res := s.db.WithContext(ctx).Model(&models.TicketDormitory{}).Where("id = ?", id).Update("status", status)
	if res.Error != nil {
		s.log.Error("failed to update dormitory ticket status", "id", id, "error", res.Error.Error())
		return res.Error
	}
	if res.RowsAffected == 0 {
		return models.ErrTicketNotFound
	}
	return nil
}

// TicketBuildStorage — хранилище заявок по учебным корпусам.
type TicketBuildStorage struct {
	db  *gorm.DB
	log *slog.Logger
}

func TicketBuildStorageNew(db *gorm.DB, log *slog.Logger) *TicketBuildStorage {
	return &TicketBuildStorage{db: db, log: log}
}

func (s *TicketBuildStorage) Create(ctx context.Context, ticket *models.TicketBuild) (int64, error) {
	if err := s.db.WithContext(ctx).Create(ticket).Error; err != nil {
		s.log.Error("failed to create build ticket", "error", err.Error())
		return 0, err
	}
	return ticket.ID, nil
}

func (s *TicketBuildStorage) ByID(ctx context.Context, id int64) (*models.TicketBuild, error) {
	var ticket models.TicketBuild
	if err := s.db.WithContext(ctx).First(&ticket, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		s.log.Error("failed to fetch build ticket by id", "id", id, "error", err.Error())
		return nil, err
	}
	return &ticket, nil
}

func (s *TicketBuildStorage) Fetch(ctx context.Context, filter models.TicketFilter) ([]models.TicketBuild, error) {
	query := applyTicketFilter(s.db.WithContext(ctx).Order("id"), filter)

	var tickets []models.TicketBuild
	if err := query.Find(&tickets).Error; err != nil {
		s.log.Error("failed to fetch build tickets", "error", err.Error())
		return nil, err
	}
	return tickets, nil
}

func (s *TicketBuildStorage) UpdateStatus(ctx context.Context, id int64, status int32) error {
	res := s.db.WithContext(ctx).Model(&models.TicketBuild{}).Where("id = ?", id).Update("status", status)
	if res.Error != nil {
		s.log.Error("failed to update build ticket status", "id", id, "error", res.Error.Error())
		return res.Error
	}
	if res.RowsAffected == 0 {
		return models.ErrTicketNotFound
	}
	return nil
}
