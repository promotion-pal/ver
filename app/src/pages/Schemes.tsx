import { DrawioDiagram } from "@/components/common/DrawioDiagram";
import { Section } from "@/components/common/Section";
import authScheme from "@/docs/schema/auth.drawio?raw";

export function Schemes() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Схемы</h1>
      <Section title="Авторизация" description="Вход через AD, синхронизация с MDM и хранение данных.">
        <DrawioDiagram xml={authScheme} />
      </Section>
    </div>
  );
}
