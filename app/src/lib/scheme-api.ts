import type { SchemeStage as StageMessage } from "@ver/proto/entity/scheme.entity_pb";
import { SchemeStageStatus as StatusEnum } from "@ver/proto/enum/scheme.enum_pb";
import type { Stage, StageDraft, StageStatus } from "@/data/schemes/types";
import { schemeStageClient } from "@/lib/api";
import { formatDate } from "@/lib/journal";

const STATUS_TO_PROTO: Record<StageStatus, StatusEnum> = {
  planned: StatusEnum.PLANNED,
  in_progress: StatusEnum.IN_PROGRESS,
  done: StatusEnum.DONE,
};

const STATUS_FROM_PROTO = new Map(
  Object.entries(STATUS_TO_PROTO).map(([key, value]) => [value, key as StageStatus]),
);

export const STAGE_STATUS_LABEL: Record<StageStatus, string> = {
  planned: "Запланирован",
  in_progress: "В работе",
  done: "Готово",
};

function toStage(s: StageMessage): Stage {
  return {
    id: Number(s.id),
    siteSlug: s.siteSlug,
    schemeId: s.schemeId,
    title: s.title,
    details: s.details,
    startDate: s.startDate,
    dueDate: s.dueDate,
    status: STATUS_FROM_PROTO.get(s.status) ?? "planned",
  };
}

/** Stages of one project, by due date (stages without one last); `schemeId` narrows to one scheme. */
export async function fetchStages(siteSlug: string, schemeId?: string): Promise<Stage[]> {
  const res = await schemeStageClient.schemeStageFetch({ siteSlug, schemeId });
  return res.stages.map(toStage);
}

export async function createStage(siteSlug: string, schemeId: string, draft: StageDraft) {
  await schemeStageClient.schemeStageCreate({
    siteSlug,
    schemeId,
    ...draft,
    status: STATUS_TO_PROTO[draft.status],
  });
}

export async function updateStage(id: number, draft: StageDraft) {
  await schemeStageClient.schemeStageUpdate({
    id: BigInt(id),
    ...draft,
    status: STATUS_TO_PROTO[draft.status],
  });
}

export async function deleteStage(id: number) {
  await schemeStageClient.schemeStageDelete({ id: BigInt(id) });
}

/** "1 окт. 2026 — 15 окт. 2026", "до …", "с …" or "Без срока". */
export function formatStageDates(stage: Pick<Stage, "startDate" | "dueDate">): string {
  const { startDate, dueDate } = stage;
  if (startDate && dueDate) return `${formatDate(startDate)} — ${formatDate(dueDate)}`;
  if (dueDate) return `до ${formatDate(dueDate)}`;
  if (startDate) return `с ${formatDate(startDate)}`;
  return "Без срока";
}

/** Not done and past its due date. */
export function isOverdue(stage: Stage, today: string): boolean {
  return stage.status !== "done" && stage.dueDate !== "" && stage.dueDate < today;
}
