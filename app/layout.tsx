import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chomoe Production CRM",
  description: "منصة التقديم وإدارة المرشحين لفريق Chomoe Production.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
