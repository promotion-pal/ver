import { timestampDate } from "@bufbuild/protobuf/wkt";
import type { Feedback as FeedbackMessage } from "@ver/proto/entity/feedback.entity_pb";
import { FeedbackAction as ActionEnum, FeedbackStatus as StatusEnum } from "@ver/proto/enum/feedback.enum_pb";
import type { Feedback, FeedbackAction, FeedbackDraft, FeedbackStatus } from "@/data/feedback/types";
import { feedbackClient } from "@/lib/api";

const ACTION_TO_PROTO: Record<FeedbackAction, ActionEnum> = {
  fix: ActionEnum.FIX,
  add: ActionEnum.ADD,
  change: ActionEnum.CHANGE,
  remove: ActionEnum.REMOVE,
  question: ActionEnum.QUESTION,
  approve: ActionEnum.APPROVE,
};

const STATUS_TO_PROTO: Record<FeedbackStatus, StatusEnum> = {
  new: StatusEnum.NEW,
  in_progress: StatusEnum.IN_PROGRESS,
  done: StatusEnum.DONE,
};

function invert<K extends string, V extends number>(map: Record<K, V>) {
  return new Map<V, K>(Object.entries(map).map(([key, value]) => [value as V, key as K]));
}
const ACTION_FROM_PROTO = invert(ACTION_TO_PROTO);
const STATUS_FROM_PROTO = invert(STATUS_TO_PROTO);

function toFeedback(f: FeedbackMessage): Feedback {
  return {
    id: Number(f.id),
    siteSlug: f.siteSlug,
    siteName: f.siteName,
    versionId: f.versionId,
    versionLabel: f.versionLabel,
    authorName: f.authorName,
    phone: f.phone,
    action: ACTION_FROM_PROTO.get(f.action) ?? "change",
    comment: f.comment,
    status: STATUS_FROM_PROTO.get(f.status) ?? "new",
    createdAt: f.createdAt ? timestampDate(f.createdAt) : new Date(),
  };
}

/** Feedback for one site (all versions), newest first. */
export async function fetchFeedback(siteSlug: string): Promise<Feedback[]> {
  const res = await feedbackClient.feedbackFetch({ siteSlug });
  return res.feedbacks.map(toFeedback);
}

export async function createFeedback(draft: FeedbackDraft) {
  await feedbackClient.feedbackCreate({ ...draft, action: ACTION_TO_PROTO[draft.action] });
}

export async function changeFeedbackStatus(id: number, status: FeedbackStatus) {
  await feedbackClient.feedbackChangeStatus({ id: BigInt(id), newStatus: STATUS_TO_PROTO[status] });
}
