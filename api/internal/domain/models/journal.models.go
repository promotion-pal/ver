package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"time"
)

var (
	// ErrJournalNotFound возвращается, когда журнал не найден.
	ErrJournalNotFound = errors.New("journal not found")
	// ErrSlugTaken возвращается, когда журнал с таким slug уже существует.
	ErrSlugTaken = errors.New("journal slug is already taken")
	// ErrEntryNotFound возвращается, когда запись журнала не найдена.
	ErrEntryNotFound = errors.New("work entry not found")
)

// DateLayout — формат календарного дня (YYYY-MM-DD) в API и в БД.
const DateLayout = "2006-01-02"

// StringList хранится в БД как jsonb-массив строк.
type StringList []string

func (l StringList) Value() (driver.Value, error) {
	if l == nil {
		return "[]", nil
	}
	b, err := json.Marshal([]string(l))
	if err != nil {
		return nil, err
	}
	return string(b), nil
}

func (l *StringList) Scan(src any) error {
	switch v := src.(type) {
	case nil:
		*l = nil
		return nil
	case []byte:
		return json.Unmarshal(v, l)
	case string:
		return json.Unmarshal([]byte(v), l)
	default:
		return fmt.Errorf("models.StringList: unsupported scan type %T", src)
	}
}

func (StringList) GormDataType() string { return "jsonb" }

type Journal struct {
	ID        int64 `gorm:"primaryKey;autoIncrement"`
	Slug      string
	Employee  string
	Role      string
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (Journal) TableName() string {
	return "journal"
}

type WorkEntry struct {
	ID        int64 `gorm:"primaryKey;autoIncrement"`
	JournalID int64
	EntryDate time.Time `gorm:"type:date"`
	SiteSlug  string
	Category  int32
	Title     string
	Details   string
	Steps     StringList
	Result    string
	Hours     float64
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (WorkEntry) TableName() string {
	return "work_entry"
}

type WorkEntryFilter struct {
	JournalID *int64
	FromDate  *time.Time
	ToDate    *time.Time
	SiteSlug  *string
	Category  *int32
}
