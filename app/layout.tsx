import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/shell/AppShell";
import "./globals.css";

const DESCRIPTION =
  "을지로·종로 소량 제작 업체와 재료상을 찾고, 후기와 제작 사례를 나누는 모바일 커뮤니티";

export const metadata: Metadata = {
  metadataBase: new URL("https://mandy-rust.vercel.app"),
  title: "MANDY · 소량 제작 업체 커뮤니티",
  description: DESCRIPTION,
  applicationName: "MANDY",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "MANDY" },
  openGraph: {
    title: "MANDY · 소량 제작 업체 커뮤니티",
    description: DESCRIPTION,
    siteName: "MANDY",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "MANDY · 소량 제작 업체 커뮤니티",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
