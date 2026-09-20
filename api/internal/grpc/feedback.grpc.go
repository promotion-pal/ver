package grpc

import (
	"context"
	"errors"
	"strings"

	"connectrpc.com/connect"
	"google.golang.org/protobuf/types/known/timestamppb"

	"dvgmu/ver/contract/gen/go/entity"
	"dvgmu/ver/contract/gen/go/enum"
	pb "dvgmu/ver/contract/gen/go/service"
	"dvgmu/ver/internal/domain/models"
	"dvgmu/ver/internal/service"
	"dvgmu/ver/internal/utils"
)

const (
	maxNameLen    = 200
	maxCommentLen = 5000
	maxLabelLen   = 300
)

type FeedbackController struct {
	service *service.FeedbackService
}

func NewFeedbackController(service *service.FeedbackService) *FeedbackController {
	return &FeedbackController{service: service}
}

func (h *FeedbackController) FeedbackFetch(
	ctx context.Context,
	req *connect.Request[pb.FeedbackFetchRequest],
) (*connect.Response[pb.FeedbackFetchResponse], error) {
	filter := models.FeedbackFilter{
		SiteSlug:  req.Msg.SiteSlug,
		VersionID: req.Msg.VersionId,
	}
	if req.Msg.Status != nil {
		status := int32(*req.Msg.Status)
		filter.Status = &status
	}

	feedbacks, err := h.service.Fetch(ctx, filter)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	resp := &pb.FeedbackFetchResponse{Feedbacks: make([]*entity.Feedback, 0, len(feedbacks))}
	for i := range feedbacks {
		resp.Feedbacks = append(resp.Feedbacks, toProtoFeedback(&feedbacks[i]))
	}
	return connect.NewResponse(resp), nil
}

func (h *FeedbackController) FeedbackCreate(
	ctx context.Context,
	req *connect.Request[pb.FeedbackCreateRequest],
) (*connect.Response[pb.FeedbackCreateResponse], error) {
	feedback, err := feedbackFromRequest(req.Msg)
	if err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}

	id, err := h.service.Create(ctx, feedback)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&pb.FeedbackCreateResponse{
		Id:      id,
		Success: true,
		Message: "feedback created",
	}), nil
}

func (h *FeedbackController) FeedbackChangeStatus(
	ctx context.Context,
	req *connect.Request[pb.FeedbackChangeStatusRequest],
) (*connect.Response[pb.FeedbackChangeStatusResponse], error) {
	if req.Msg.GetId() == 0 {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("id is required"))
	}
	status := req.Msg.GetNewStatus()
	if _, ok := enum.FeedbackStatus_name[int32(status)]; !ok || status == enum.FeedbackStatus_FEEDBACK_STATUS_UNSPECIFIED {
		return nil, connect.NewError(connect.CodeInvalidArgument, errors.New("newStatus is required"))
	}

	if err := h.service.ChangeStatus(ctx, req.Msg.GetId(), int32(status)); err != nil {
		if errors.Is(err, models.ErrFeedbackNotFound) {
			return nil, connect.NewError(connect.CodeNotFound, err)
		}
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&pb.FeedbackChangeStatusResponse{
		Id:      req.Msg.GetId(),
		Success: true,
		Message: "feedback status changed",
	}), nil
}

// feedbackFromRequest проверяет вход и собирает модель; ошибка — это InvalidArgument.
func feedbackFromRequest(in *pb.FeedbackCreateRequest) (*models.Feedback, error) {
	siteSlug := strings.TrimSpace(in.GetSiteSlug())
	versionID := strings.TrimSpace(in.GetVersionId())
	if siteSlug == "" || versionID == "" {
		return nil, errors.New("siteSlug and versionId are required")
	}

	name := strings.Join(strings.Fields(in.GetAuthorName()), " ")
	if len(strings.Fields(name)) < 2 {
		return nil, errors.New("authorName must contain at least a surname and a name")
	}
	if len(name) > maxNameLen {
		return nil, errors.New("authorName is too long")
	}

	phone, err := utils.NormalizePhone(in.GetPhone())
	if err != nil {
		return nil, err
	}

	action := in.GetAction()
	if _, ok := enum.FeedbackAction_name[int32(action)]; !ok || action == enum.FeedbackAction_FEEDBACK_ACTION_UNSPECIFIED {
		return nil, errors.New("action is required")
	}

	comment := strings.TrimSpace(in.GetComment())
	if comment == "" {
		return nil, errors.New("comment is required")
	}
	if len(comment) > maxCommentLen {
		return nil, errors.New("comment is too long")
	}

	siteName := strings.TrimSpace(in.GetSiteName())
	if siteName == "" {
		siteName = siteSlug
	}
	versionLabel := strings.TrimSpace(in.GetVersionLabel())
	if len(siteName) > maxLabelLen || len(versionLabel) > maxLabelLen || len(siteSlug) > maxLabelLen || len(versionID) > maxLabelLen {
		return nil, errors.New("site or version fields are too long")
	}

	return &models.Feedback{
		SiteSlug:     siteSlug,
		SiteName:     siteName,
		VersionID:    versionID,
		VersionLabel: versionLabel,
		AuthorName:   name,
		Phone:        phone,
		Action:       int32(action),
		Comment:      comment,
		Status:       int32(enum.FeedbackStatus_FEEDBACK_STATUS_NEW),
	}, nil
}

func toProtoFeedback(f *models.Feedback) *entity.Feedback {
	return &entity.Feedback{
		Id:           f.ID,
		SiteSlug:     f.SiteSlug,
		SiteName:     f.SiteName,
		VersionId:    f.VersionID,
		VersionLabel: f.VersionLabel,
		AuthorName:   f.AuthorName,
		Phone:        f.Phone,
		Action:       enum.FeedbackAction(f.Action),
		Comment:      f.Comment,
		Status:       enum.FeedbackStatus(f.Status),
		CreatedAt:    timestamppb.New(f.CreatedAt),
		UpdatedAt:    timestamppb.New(f.UpdatedAt),
	}
}
