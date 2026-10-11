import type { Metadata } from "next";
import "./globals.css";
import { DemoProvider, Shell } from "@/components/demo-provider";
export const metadata: Metadata = {
  title: "Gift Store · Presentes para sentir",
  description:
    "Uma loja demonstrativa de presentes, com carinho em cada detalhe.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <DemoProvider>
          <Shell>{children}</Shell>
        </DemoProvider>
      </body>
    </html>
  );
}
