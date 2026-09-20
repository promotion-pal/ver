package grpc

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"connectrpc.com/connect"
	"google.golang.org/protobuf/types/known/timestamppb"

	"dvgmu/ver/contract/gen/go/entity"
	"dvgmu/ver/contract/gen/go/enum"
	pb "dvgmu/ver/contract/gen/go/service"
	"dvgmu/ver/internal/domain/models"
	"dvgmu/ver/internal/service"
)

const (
	maxTitleLen   = 300
	maxTextLen    = 5000
	maxSteps      = 50
	maxHoursInDay = 24
)

// workEntryInput — общие поля создания и обновления записи.
type workEntryInput struct {
	date     string
	siteSlug string
	category enum.WorkCategory
	title    string
	details  string
	steps    []string
	result   string
	hours    float64
}

// toModel проверяет вход и собирает модель; ошибка — это InvalidArgument.
func (in workEntryInput) toModel() (*models.WorkEntry, error) {
	date, err := time.Parse(models.DateLayout, in.date)
	if err != nil {
		return nil, errors.New("date must be an ISO day, YYYY-MM-DD")
	}
	if _, ok := enum.WorkCategory_name[int32(in.category)]; !ok || in.category == enum.WorkCategory_WORK_CATEGORY_UNSPECIFIED {
		return nil, errors.New("category is required")
	}
	title := strings.TrimSpace(in.title)
	if title == "" {
		return nil, errors.New("title is required")
	}
	if len(title) > maxTitleLen || len(in.details) > maxTextLen || len(in.result) > maxTextLen {
		return nil, errors.New("title, details or result is too long")
	}
	if in.hours <= 0 || in.hours > maxHoursInDay {
		return nil, fmt.Errorf("hours must be greater than 0 and at most %d", maxHoursInDay)
	}

	steps := make(models.StringList, 0, len(in.steps))
	for _, step := range in.steps {
		if step = strings.TrimSpace(step); step != "" {
			steps = append(steps, step)
		}
	}
	if len(steps) > maxSteps {
		return nil, fmt.Errorf("at most %d steps are allowed", maxSteps)
	}

	return &models.WorkEntry{
		EntryDate: date,
		SiteSlug:  strings.TrimSpace(in.siteSlug),
		Category:  int32(in.category),
		Title:     title,
		Details:   strings.TrimSpace(in.details),
		Steps:     steps,
		Result:    strings.TrimSpace(in.result),
		Hours:     in.hours,
	}, nil
}

type WorkEntryController struct {
	service *service.WorkEntryService
}

func NewWorkEntryController(service *service.WorkEntryService) *WorkEntryController {
	return &WorkEntryController{service: service}
}

func (h *WorkEntryController) WorkEntryFetch(
	ctx context.Context,
	req *connect.Request[pb.WorkEntryFetchRequest],
) (*connect.Response[pb.WorkEntryFetchResponse], error) {
	filter := models.WorkEntryFilter{
		JournalID: req.Msg.JournalId,
		SiteSlug:  req.Msg.SiteSlug,
	}
	if req.Msg.Category != nil {
		category := int32(*req.Msg.Category)
		filter.Category = &category
	}
	for _, d := range []struct {
		raw *string
		dst **time.Time
	}{{req.Msg.FromDate, &filter.FromDate}, {req.Msg.ToDate, &filter.ToDate}} {
		if d.raw == nil {
			continue
		}
		t, err := time.Parse(models.DateLayout, *d.raw)
		if err != nil {
			return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("dates must be ISO days, YYYY-MM-DD"))
		}
		*d.dst = &t
	}

	entries, err := h.service.Fetch(ctx, filter)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	resp := &pb.WorkEntryFetchResponse{Entries: make([]*entity.WorkEntry, 0, len(entries))}
	for i := range entries {
		resp.Entries = append(resp.Entries, toProtoWorkEntry(&entries[i]))
	}
	return connect.NewResponse(resp), nil
}

func (h *WorkEntryController) WorkEntryCreate(
	ctx context.Context,
	req *connect.Request[pb.WorkEntryCreateRequest],
) (*connect.Response[pb.WorkEntryCreateResponse], error) {
	if req.Msg.GetJournalId() == 0 {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("journalId is required"))
	}

	entry, err := workEntryInput{
		date:     req.Msg.GetDate(),
		siteSlug: req.Msg.GetSiteSlug(),
		category: req.Msg.GetCategory(),
		title:    req.Msg.GetTitle(),
		details:  req.Msg.GetDetails(),
		steps:    req.Msg.GetSteps(),
		result:   req.Msg.GetResult(),
		hours:    req.Msg.GetHours(),
	}.toModel()
	if err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}
	entry.JournalID = req.Msg.GetJournalId()

	id, err := h.service.Create(ctx, entry)
	if err != nil {
		if errors.Is(err, models.ErrJournalNotFound) {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&pb.WorkEntryCreateResponse{
		Id:      id,
		Success: true,
		Message: "work entry created",
	}), nil
}

func (h *WorkEntryController) WorkEntryUpdate(
	ctx context.Context,
	req *connect.Request[pb.WorkEntryUpdateRequest],
) (*connect.Response[pb.WorkEntryUpdateResponse], error) {
	if req.Msg.GetId() == 0 {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("id is required"))
	}

	entry, err := workEntryInput{
		date:     req.Msg.GetDate(),
		siteSlug: req.Msg.GetSiteSlug(),
		category: req.Msg.GetCategory(),
		title:    req.Msg.GetTitle(),
		details:  req.Msg.GetDetails(),
		steps:    req.Msg.GetSteps(),
		result:   req.Msg.GetResult(),
		hours:    req.Msg.GetHours(),
	}.toModel()
	if err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}
	entry.ID = req.Msg.GetId()

	if err := h.service.Update(ctx, entry); err != nil {
		if errors.Is(err, models.ErrEntryNotFound) {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&pb.WorkEntryUpdateResponse{
		Id:      entry.ID,
		Success: true,
		Message: "work entry updated",
	}), nil
}

func (h *WorkEntryController) WorkEntryDelete(
	ctx context.Context,
	req *connect.Request[pb.WorkEntryDeleteRequest],
) (*connect.Response[pb.WorkEntryDeleteResponse], error) {
	if req.Msg.GetId() == 0 {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("id is required"))
	}

	if err := h.service.Delete(ctx, req.Msg.GetId()); err != nil {
		if errors.Is(err, models.ErrEntryNotFound) {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&pb.WorkEntryDeleteResponse{
		Id:      req.Msg.GetId(),
		Success: true,
		Message: "work entry deleted",
	}), nil
}

func toProtoWorkEntry(entry *models.WorkEntry) *entity.WorkEntry {
	return &entity.WorkEntry{
		Id:        entry.ID,
		JournalId: entry.JournalID,
		Date:      entry.EntryDate.Format(models.DateLayout),
		SiteSlug:  entry.SiteSlug,
		Category:  enum.WorkCategory(entry.Category),
		Title:     entry.Title,
		Details:   entry.Details,
		Steps:     entry.Steps,
		Result:    entry.Result,
		Hours:     entry.Hours,
		CreatedAt: timestamppb.New(entry.CreatedAt),
		UpdatedAt: timestamppb.New(entry.UpdatedAt),
	}
}
