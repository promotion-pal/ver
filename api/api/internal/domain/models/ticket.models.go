package models

import (
	"errors"
	"time"
)

// ErrTicketNotFound возвращается, когда заявка с указанным id отсутствует.
var ErrTicketNotFound = errors.New("ticket not found")

type TicketDormitory struct {
	ID        int64 `gorm:"primaryKey;autoIncrement"`
	UserID    int64
	Room      int32
	Location  int32
	Comment   string
	Type      int32
	Status    int32
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (TicketDormitory) TableName() string {
	return "ticket_dormitory"
}

type TicketBuild struct {
	ID        int64 `gorm:"primaryKey;autoIncrement"`
	UserID    int64
	Room      int32
	Location  int32
	Comment   string
	Type      int32
	Status    int32
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (TicketBuild) TableName() string {
	return "ticket_build"
}

type TicketFilter struct {
	UserID    *int64
	Room      *int32
	Location  *int32
	Type      *int32
	Status    *int32
	StartDate *time.Time
	EndDate   *time.Time
}
