package grpc

import (
	"context"
	"errors"

	"connectrpc.com/connect"
	"google.golang.org/protobuf/types/known/timestamppb"

	"dvgmu/tickets/contract/gen/go/entity"
	"dvgmu/tickets/contract/gen/go/enum"
	pb "dvgmu/tickets/contract/gen/go/service"
	"dvgmu/tickets/internal/domain/models"
	"dvgmu/tickets/internal/service"
)

func ticketFilterFromRequest(
	userID *int64,
	room *int32,
	location *int32,
	ticketType *int32,
	status *int32,
	startDate *timestamppb.Timestamp,
	endDate *timestamppb.Timestamp,
) models.TicketFilter {
	filter := models.TicketFilter{
		UserID:   userID,
		Room:     room,
		Location: location,
		Type:     ticketType,
		Status:   status,
	}
	if startDate != nil {
		t := startDate.AsTime()
		filter.StartDate = &t
	}
	if endDate != nil {
		t := endDate.AsTime()
		filter.EndDate = &t
	}
	return filter
}

func int32Ptr[T ~int32](v *T) *int32 {
	if v == nil {
		return nil
	}
	out := int32(*v)
	return &out
}

type TicketDormitoryController struct {
	service *service.TicketDormitoryService
}

func NewTicketDormitoryController(service *service.TicketDormitoryService) *TicketDormitoryController {
	return &TicketDormitoryController{service: service}
}

func (h *TicketDormitoryController) TicketDormitoryCreate(
	ctx context.Context,
	req *connect.Request[pb.TicketDormitoryCreateRequest],
) (*connect.Response[pb.TicketDormitoryCreateResponse], error) {
	if req.Msg.GetUserId() == 0 {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("userId is required"))
	}

	ticket := &models.TicketDormitory{
		UserID:   req.Msg.GetUserId(),
		Room:     req.Msg.GetRoom(),
		Location: int32(req.Msg.GetLocation()),
		Comment:  req.Msg.GetComment(),
		Type:     int32(req.Msg.GetType()),
	}

	id, err := h.service.Create(ctx, ticket)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&pb.TicketDormitoryCreateResponse{
		Success: true,
		Message: "dormitory ticket created",
		Id:      id,
	}), nil
}

func (h *TicketDormitoryController) TicketDormitoryByID(
	ctx context.Context,
	req *connect.Request[pb.TicketDormitoryByIDRequest],
) (*connect.Response[pb.TicketDormitoryByIDResponse], error) {
	ticket, err := h.service.ByID(ctx, req.Msg.GetId())
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	if ticket == nil {
		return nil, connect.NewError(connect.CodeNotFound, errors.New("dormitory ticket not found"))
	}

	return connect.NewResponse(&pb.TicketDormitoryByIDResponse{
		Entity: toProtoTicketDormitory(ticket),
	}), nil
}

func (h *TicketDormitoryController) TicketDormitoryFetch(
	ctx context.Context,
	req *connect.Request[pb.TicketDormitoryFetchRequest],
) (*connect.Response[pb.TicketDormitoryFetchResponse], error) {
	filter := ticketFilterFromRequest(
		req.Msg.UserId,
		req.Msg.Room,
		int32Ptr(req.Msg.Location),
		int32Ptr(req.Msg.Type),
		int32Ptr(req.Msg.Status),
		req.Msg.StartDate,
		req.Msg.EndDate,
	)

	tickets, err := h.service.Fetch(ctx, filter)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	resp := &pb.TicketDormitoryFetchResponse{
		Tickets: make([]*entity.TicketDormitory, 0, len(tickets)),
	}
	for i := range tickets {
		resp.Tickets = append(resp.Tickets, toProtoTicketDormitory(&tickets[i]))
	}
	return connect.NewResponse(resp), nil
}

func (h *TicketDormitoryController) TicketDormitoryChangeStatus(
	ctx context.Context,
	req *connect.Request[pb.TicketDormitoryChangeStatusRequest],
) (*connect.Response[pb.TicketDormitoryChangeStatusResponse], error) {
	if req.Msg.GetId() == 0 {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("id is required"))
	}

	if err := h.service.ChangeStatus(ctx, req.Msg.GetId(), int32(req.Msg.GetNewStatus())); err != nil {
		if errors.Is(err, models.ErrTicketNotFound) {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&pb.TicketDormitoryChangeStatusResponse{
		Id:      req.Msg.GetId(),
		Success: true,
		Message: "dormitory ticket status changed",
	}), nil
}

func toProtoTicketDormitory(ticket *models.TicketDormitory) *entity.TicketDormitory {
	return &entity.TicketDormitory{
		Id:        ticket.ID,
		UserId:    ticket.UserID,
		Room:      ticket.Room,
		Location:  enum.LocationDormitoryType(ticket.Location),
		Comment:   ticket.Comment,
		Type:      enum.TicketType(ticket.Type),
		Status:    enum.TicketStatus(ticket.Status),
		CreatedAt: timestamppb.New(ticket.CreatedAt),
		UpdatedAt: timestamppb.New(ticket.UpdatedAt),
	}
}

type TicketBuildController struct {
	service *service.TicketBuildService
}

func NewTicketBuildController(service *service.TicketBuildService) *TicketBuildController {
	return &TicketBuildController{service: service}
}

func (h *TicketBuildController) TicketBuildCreate(
	ctx context.Context,
	req *connect.Request[pb.TicketBuildCreateRequest],
) (*connect.Response[pb.TicketBuildCreateResponse], error) {
	if req.Msg.GetUserId() == 0 {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("userId is required"))
	}

	ticket := &models.TicketBuild{
		UserID:   req.Msg.GetUserId(),
		Room:     req.Msg.GetRoom(),
		Location: int32(req.Msg.GetLocation()),
		Comment:  req.Msg.GetComment(),
		Type:     int32(req.Msg.GetType()),
	}

	id, err := h.service.Create(ctx, ticket)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&pb.TicketBuildCreateResponse{
		Success: true,
		Message: "build ticket created",
		Id:      id,
	}), nil
}

func (h *TicketBuildController) TicketBuildByID(
	ctx context.Context,
	req *connect.Request[pb.TicketBuildByIDRequest],
) (*connect.Response[pb.TicketBuildByIDResponse], error) {
	ticket, err := h.service.ByID(ctx, req.Msg.GetId())
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}
	if ticket == nil {
		return nil, connect.NewError(connect.CodeNotFound, errors.New("build ticket not found"))
	}

	return connect.NewResponse(&pb.TicketBuildByIDResponse{
		Entity: toProtoTicketBuild(ticket),
	}), nil
}

func (h *TicketBuildController) TicketBuildFetch(
	ctx context.Context,
	req *connect.Request[pb.TicketBuildFetchRequest],
) (*connect.Response[pb.TicketBuildFetchResponse], error) {
	filter := ticketFilterFromRequest(
		req.Msg.UserId,
		req.Msg.Room,
		int32Ptr(req.Msg.Location),
		int32Ptr(req.Msg.Type),
		int32Ptr(req.Msg.Status),
		req.Msg.StartDate,
		req.Msg.EndDate,
	)

	tickets, err := h.service.Fetch(ctx, filter)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	resp := &pb.TicketBuildFetchResponse{
		Tickets: make([]*entity.TicketBuild, 0, len(tickets)),
	}
	for i := range tickets {
		resp.Tickets = append(resp.Tickets, toProtoTicketBuild(&tickets[i]))
	}
	return connect.NewResponse(resp), nil
}

func (h *TicketBuildController) TicketBuildChangeStatus(
	ctx context.Context,
	req *connect.Request[pb.TicketBuildChangeStatusRequest],
) (*connect.Response[pb.TicketBuildChangeStatusResponse], error) {
	if req.Msg.GetId() == 0 {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("id is required"))
	}

	if err := h.service.ChangeStatus(ctx, req.Msg.GetId(), int32(req.Msg.GetNewStatus())); err != nil {
		if errors.Is(err, models.ErrTicketNotFound) {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&pb.TicketBuildChangeStatusResponse{
		Id:      req.Msg.GetId(),
		Success: true,
		Message: "build ticket status changed",
	}), nil
}

func toProtoTicketBuild(ticket *models.TicketBuild) *entity.TicketBuild {
	return &entity.TicketBuild{
		Id:        ticket.ID,
		UserId:    ticket.UserID,
		Room:      ticket.Room,
		Location:  enum.LocationBuildType(ticket.Location),
		Comment:   ticket.Comment,
		Type:      enum.TicketType(ticket.Type),
		Status:    enum.TicketStatus(ticket.Status),
		CreatedAt: timestamppb.New(ticket.CreatedAt),
		UpdatedAt: timestamppb.New(ticket.UpdatedAt),
	}
}
