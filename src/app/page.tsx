import { existsSync } from "node:fs";
import { join } from "node:path";
import { FriendshipBanner } from "@/components/friendship-banner";
import { Suspense } from "react";
import { DemoPage } from "@/components/pages";
export default function Page() {
  const filename = [
    "friends-selfie.webp",
    "banner-amigos.jpg",
    "banner-amigos.webp",
    "banner-amigos.png",
  ].find((name) => existsSync(join(process.cwd(), "public", "photos", name)));
  return (
    <Suspense fallback={<div className="empty">Carregando presentes…</div>}>
      <DemoPage
        path="/"
        banner={
          filename ? <FriendshipBanner photo={"/photos/" + filename} /> : null
        }
      />
    </Suspense>
  );
}
