import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatRange,
  PERIOD_LABEL,
  rangeFor,
  shiftAnchor,
  todayISO,
  type Period,
} from "@/lib/journal";

/** Day / week / month tabs with prev / next / today navigation. */
export function PeriodSwitcher({
  period,
  onPeriodChange,
  anchor,
  onAnchorChange,
  periods = ["day", "week", "month"],
}: {
  period: Period;
  onPeriodChange: (period: Period) => void;
  anchor: string;
  onAnchorChange: (anchor: string) => void;
  periods?: Period[];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tabs value={period} onValueChange={(value) => onPeriodChange(value as Period)}>
        <TabsList>
          {periods.map((p) => (
            <TabsTrigger key={p} value={p}>
              {PERIOD_LABEL[p]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Предыдущий период"
          onClick={() => onAnchorChange(shiftAnchor(anchor, period, -1))}
        >
          <ChevronLeft />
        </Button>
        <span className="min-w-44 px-2 text-center text-sm font-medium">
          {formatRange(rangeFor(anchor, period), period)}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Следующий период"
          onClick={() => onAnchorChange(shiftAnchor(anchor, period, 1))}
        >
          <ChevronRight />
        </Button>
      </div>
      <Button variant="ghost" size="sm" onClick={() => onAnchorChange(todayISO())}>
        Сегодня
      </Button>
    </div>
  );
}
