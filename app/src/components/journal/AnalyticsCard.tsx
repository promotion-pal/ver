import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AnalyticsCard() {
  return (
    <Link to="/analytics" className="block">
      <Card className="h-full gap-3 transition-colors hover:border-foreground/20">
        <CardHeader className="flex flex-row items-center gap-2">
          <BarChart3 className="size-4 text-muted-foreground" />
          <h3 className="text-base font-semibold tracking-tight">Аналитика</h3>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Часы и записи по журналам сотрудников и по сайтам: неделя, месяц, динамика по дням.
        </CardContent>
      </Card>
    </Link>
  );
}
