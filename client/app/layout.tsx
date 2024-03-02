"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();

  return (
    <>
      <html lang="en">
        <body className={inter.className}>
          <GoogleOAuthProvider clientId="721031521118-1rs34m54fd73ds0pn1oa1ocn2f7kb4bp.apps.googleusercontent.com">
            <QueryClientProvider client={queryClient}>
              <ReactQueryDevtools />
              <Toaster />
              {children}
            </QueryClientProvider>
          </GoogleOAuthProvider>
        </body>
      </html>
    </>
  );
}
