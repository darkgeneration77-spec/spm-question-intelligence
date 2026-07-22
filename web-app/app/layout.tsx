import type { Metadata } from "next";
import "./globals.css";
import "./management.css";

export const metadata: Metadata = {
  title: "SPM Question Intelligence",
  description: "SPM 历年题目、资料质量与复习优先级分析平台",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hans">
      <body>{children}</body>
    </html>
  );
}
