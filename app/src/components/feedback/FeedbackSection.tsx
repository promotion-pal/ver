import { useState } from "react";
import { LoadState } from "@/components/common/LoadState";
import { Section } from "@/components/common/Section";
import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { FeedbackList } from "@/components/feedback/FeedbackList";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Feedback, FeedbackStatus } from "@/data/feedback/types";
import type { SiteDoc, SiteVersion } from "@/data/types";
import { changeFeedbackStatus, fetchFeedback } from "@/lib/feedback-api";
import { apiErrorMessage } from "@/lib/journal-api";
import { useAsync } from "@/lib/use-async";

type Scope = "version" | "all";

/** The feedback form for the open version plus the feedback already left on this site. */
export function FeedbackSection({ site, version }: { site: SiteDoc; version: SiteVersion }) {
  const [scope, setScope] = useState<Scope>("version");
  const [actionError, setActionError] = useState<string | null>(null);
  const state = useAsync(() => fetchFeedback(site.slug), [site.slug]);

  const all = state.data ?? [];
  const forVersion = all.filter((f) => f.versionId === version.id);
  const shown = scope === "version" ? forVersion : all;

  async function changeStatus(feedback: Feedback, status: FeedbackStatus) {
    setActionError(null);
    try {
      await changeFeedbackStatus(feedback.id, status);
    } catch (error) {
      setActionError(apiErrorMessage(error));
    }
    state.reload();
  }

  return (
    <div className="space-y-8">
      <Section
        title="Обратная связь"
        description="Оставьте комментарий по этой версии сайта — мы учтём его в доработках."
      >
        <FeedbackForm site={site} version={version} onCreated={state.reload} />
      </Section>

      <Section
        title="Комментарии заказчиков"
        action={
          <Tabs value={scope} onValueChange={(value) => setScope(value as Scope)}>
            <TabsList>
              <TabsTrigger value="version">Эта версия ({forVersion.length})</TabsTrigger>
              <TabsTrigger value="all">Все версии ({all.length})</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      >
        <LoadState loading={state.loading && !state.data} error={state.error} onRetry={state.reload} />
        {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
        {state.data ? (
          <FeedbackList
            feedbacks={shown}
            onStatusChange={changeStatus}
            emptyText={
              scope === "version" ? "К этой версии обратной связи пока нет." : "Обратной связи пока нет."
            }
          />
        ) : null}
      </Section>
    </div>
  );
}
