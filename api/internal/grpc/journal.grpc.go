package grpc

import (
	"context"
	"errors"
	"regexp"
	"strings"

	"connectrpc.com/connect"
	"google.golang.org/protobuf/types/known/timestamppb"

	"dvgmu/ver/contract/gen/go/entity"
	pb "dvgmu/ver/contract/gen/go/service"
	"dvgmu/ver/internal/domain/models"
	"dvgmu/ver/internal/service"
)

var slugPattern = regexp.MustCompile(`^[a-z0-9]+(-[a-z0-9]+)*$`)

type JournalController struct {
	service *service.JournalService
}

func NewJournalController(service *service.JournalService) *JournalController {
	return &JournalController{service: service}
}

func (h *JournalController) JournalList(
	ctx context.Context,
	_ *connect.Request[pb.JournalListRequest],
) (*connect.Response[pb.JournalListResponse], error) {
	journals, err := h.service.List(ctx)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	resp := &pb.JournalListResponse{Journals: make([]*entity.Journal, 0, len(journals))}
	for i := range journals {
		resp.Journals = append(resp.Journals, toProtoJournal(&journals[i]))
	}
	return connect.NewResponse(resp), nil
}

func (h *JournalController) JournalBySlug(
	ctx context.Context,
	req *connect.Request[pb.JournalBySlugRequest],
) (*connect.Response[pb.JournalBySlugResponse], error) {
	journal, err := h.service.BySlug(ctx, req.Msg.GetSlug())
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	if journal == nil {
		return nil, connect.NewError(connect.CodeNotFound, models.ErrJournalNotFound)
	}

	return connect.NewResponse(&pb.JournalBySlugResponse{Entity: toProtoJournal(journal)}), nil
}

func (h *JournalController) JournalCreate(
	ctx context.Context,
	req *connect.Request[pb.JournalCreateRequest],
) (*connect.Response[pb.JournalCreateResponse], error) {
	slug := strings.TrimSpace(req.Msg.GetSlug())
	employee := strings.TrimSpace(req.Msg.GetEmployee())
	if len(slug) > 64 || !slugPattern.MatchString(slug) {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("slug must be lowercase latin letters, digits and dashes"))
	}
	if employee == "" {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("employee is required"))
	}

	id, err := h.service.Create(ctx, &models.Journal{
		Slug:     slug,
		Employee: employee,
		Role:     strings.TrimSpace(req.Msg.GetRole()),
	})
	if err != nil {
		if errors.Is(err, models.ErrSlugTaken) {
			return nil, connect.NewError(connect.CodeAlreadyExists, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&pb.JournalCreateResponse{
		Id:      id,
		Success: true,
		Message: "journal created",
	}), nil
}

func toProtoJournal(journal *models.Journal) *entity.Journal {
	return &entity.Journal{
		Id:        journal.ID,
		Slug:      journal.Slug,
		Employee:  journal.Employee,
		Role:      journal.Role,
		CreatedAt: timestamppb.New(journal.CreatedAt),
		UpdatedAt: timestamppb.New(journal.UpdatedAt),
	}
}
