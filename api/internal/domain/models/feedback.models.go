package models

import (
	"errors"
	"time"
)

// ErrFeedbackNotFound возвращается, когда отзыв с указанным id отсутствует.
var ErrFeedbackNotFound = errors.New("feedback not found")

type Feedback struct {
	ID           int64 `gorm:"primaryKey;autoIncrement"`
	SiteSlug     string
	SiteName     string
	VersionID    string
	VersionLabel string
	AuthorName   string
	Phone        string
	Action       int32
	Comment      string
	Status       int32
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func (Feedback) TableName() string {
	return "feedback"
}

type FeedbackFilter struct {
	SiteSlug  *string
	VersionID *string
	Status    *int32
}
