package models

import (
	"errors"
	"time"
)

// ErrSchemeStageNotFound возвращается, когда этапа с указанным id нет.
var ErrSchemeStageNotFound = errors.New("scheme stage not found")

// SchemeStage — этап плана работ по схеме проекта: что сделать и в какие сроки.
type SchemeStage struct {
	ID        int64 `gorm:"primaryKey;autoIncrement"`
	SiteSlug  string
	SchemeID  string
	Title     string
	Details   string
	StartDate *time.Time `gorm:"type:date"`
	DueDate   *time.Time `gorm:"type:date"`
	Status    int32
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (SchemeStage) TableName() string {
	return "scheme_stage"
}

type SchemeStageFilter struct {
	SiteSlug string
	SchemeID *string
}
