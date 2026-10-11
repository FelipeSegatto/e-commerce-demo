import { Suspense } from "react";
import { DemoPage } from "@/components/pages";
export default function Page() {
  return (
    <Suspense fallback={<div className="empty">Carregando presentes…</div>}>
      <DemoPage path="/" />
    </Suspense>
  );
}
