import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Quiz App",
  description: "Online Examination Portal"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
