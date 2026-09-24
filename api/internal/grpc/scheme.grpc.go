package grpc

import (
	"context"
	"errors"
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

// schemeStageInput — общие поля создания и обновления этапа.
type schemeStageInput struct {
	title     string
	details   string
	startDate string
	dueDate   string
	status    enum.SchemeStageStatus
}

// parseOptionalDate: пустая строка — даты нет.
func parseOptionalDate(raw string) (*time.Time, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil, nil
	}
	t, err := time.Parse(models.DateLayout, raw)
	if err != nil {
		return nil, errors.New("dates must be ISO days, YYYY-MM-DD")
	}
	return &t, nil
}

func formatOptionalDate(t *time.Time) string {
	if t == nil {
		return ""
	}
	return t.Format(models.DateLayout)
}

// toModel проверяет вход и собирает модель; ошибка — это InvalidArgument.
func (in schemeStageInput) toModel() (*models.SchemeStage, error) {
	title := strings.TrimSpace(in.title)
	if title == "" {
		return nil, errors.New("title is required")
	}
	details := strings.TrimSpace(in.details)
	if len(title) > maxTitleLen || len(details) > maxTextLen {
		return nil, errors.New("title or details is too long")
	}
	start, err := parseOptionalDate(in.startDate)
	if err != nil {
		return nil, err
	}
	due, err := parseOptionalDate(in.dueDate)
	if err != nil {
		return nil, err
	}
	if start != nil && due != nil && due.Before(*start) {
		return nil, errors.New("dueDate must not be before startDate")
	}
	status := in.status
	if status == enum.SchemeStageStatus_SCHEME_STAGE_STATUS_UNSPECIFIED {
		status = enum.SchemeStageStatus_SCHEME_STAGE_STATUS_PLANNED
	}
	if _, ok := enum.SchemeStageStatus_name[int32(status)]; !ok {
		return nil, errors.New("unknown status")
	}

	return &models.SchemeStage{
		Title:     title,
		Details:   details,
		StartDate: start,
		DueDate:   due,
		Status:    int32(status),
	}, nil
}

type SchemeStageController struct {
	service *service.SchemeStageService
}

func NewSchemeStageController(service *service.SchemeStageService) *SchemeStageController {
	return &SchemeStageController{service: service}
}

func (h *SchemeStageController) SchemeStageFetch(
	ctx context.Context,
	req *connect.Request[pb.SchemeStageFetchRequest],
) (*connect.Response[pb.SchemeStageFetchResponse], error) {
	siteSlug := strings.TrimSpace(req.Msg.GetSiteSlug())
	if siteSlug == "" {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("siteSlug is required"))
	}

	stages, err := h.service.Fetch(ctx, models.SchemeStageFilter{SiteSlug: siteSlug, SchemeID: req.Msg.SchemeId})
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	resp := &pb.SchemeStageFetchResponse{Stages: make([]*entity.SchemeStage, 0, len(stages))}
	for i := range stages {
		resp.Stages = append(resp.Stages, toProtoSchemeStage(&stages[i]))
	}
	return connect.NewResponse(resp), nil
}

func (h *SchemeStageController) SchemeStageCreate(
	ctx context.Context,
	req *connect.Request[pb.SchemeStageCreateRequest],
) (*connect.Response[pb.SchemeStageCreateResponse], error) {
	siteSlug := strings.TrimSpace(req.Msg.GetSiteSlug())
	schemeID := strings.TrimSpace(req.Msg.GetSchemeId())
	if siteSlug == "" || schemeID == "" {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("siteSlug and schemeId are required"))
	}
	if len(siteSlug) > maxLabelLen || len(schemeID) > maxLabelLen {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("siteSlug or schemeId is too long"))
	}

	stage, err := schemeStageInput{
		title:     req.Msg.GetTitle(),
		details:   req.Msg.GetDetails(),
		startDate: req.Msg.GetStartDate(),
		dueDate:   req.Msg.GetDueDate(),
		status:    req.Msg.GetStatus(),
	}.toModel()
	if err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}
	stage.SiteSlug = siteSlug
	stage.SchemeID = schemeID

	id, err := h.service.Create(ctx, stage)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&pb.SchemeStageCreateResponse{
		Id:      id,
		Success: true,
		Message: "scheme stage created",
	}), nil
}

func (h *SchemeStageController) SchemeStageUpdate(
	ctx context.Context,
	req *connect.Request[pb.SchemeStageUpdateRequest],
) (*connect.Response[pb.SchemeStageUpdateResponse], error) {
	if req.Msg.GetId() == 0 {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("id is required"))
	}

	stage, err := schemeStageInput{
		title:     req.Msg.GetTitle(),
		details:   req.Msg.GetDetails(),
		startDate: req.Msg.GetStartDate(),
		dueDate:   req.Msg.GetDueDate(),
		status:    req.Msg.GetStatus(),
	}.toModel()
	if err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}
	stage.ID = req.Msg.GetId()

	if err := h.service.Update(ctx, stage); err != nil {
		if errors.Is(err, models.ErrSchemeStageNotFound) {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&pb.SchemeStageUpdateResponse{
		Id:      stage.ID,
		Success: true,
		Message: "scheme stage updated",
	}), nil
}

func (h *SchemeStageController) SchemeStageDelete(
	ctx context.Context,
	req *connect.Request[pb.SchemeStageDeleteRequest],
) (*connect.Response[pb.SchemeStageDeleteResponse], error) {
	if req.Msg.GetId() == 0 {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("id is required"))
	}

	if err := h.service.Delete(ctx, req.Msg.GetId()); err != nil {
		if errors.Is(err, models.ErrSchemeStageNotFound) {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&pb.SchemeStageDeleteResponse{
		Id:      req.Msg.GetId(),
		Success: true,
		Message: "scheme stage deleted",
	}), nil
}

func toProtoSchemeStage(s *models.SchemeStage) *entity.SchemeStage {
	return &entity.SchemeStage{
		Id:        s.ID,
		SiteSlug:  s.SiteSlug,
		SchemeId:  s.SchemeID,
		Title:     s.Title,
		Details:   s.Details,
		StartDate: formatOptionalDate(s.StartDate),
		DueDate:   formatOptionalDate(s.DueDate),
		Status:    enum.SchemeStageStatus(s.Status),
		CreatedAt: timestamppb.New(s.CreatedAt),
		UpdatedAt: timestamppb.New(s.UpdatedAt),
	}
}
