import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/shell/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "MANDY · 소량 제작 업체 커뮤니티",
  description:
    "을지로·종로 소량 제작 업체와 재료상을 찾고, 후기와 제작 사례를 나누는 모바일 커뮤니티",
  applicationName: "MANDY",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "MANDY" },
};

export const viewport: Viewport = {
  themeColor: "#138a9e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
