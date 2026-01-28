import "./globals.css";
import { ReactNode } from "react";
import { ToastProvider } from "../components/ToastProvider";

export const metadata = {
  title: "Quiz App",
  description: "Online Examination Portal"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="app-body">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
