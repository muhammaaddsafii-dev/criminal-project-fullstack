// src/app/layout.tsx - UPDATED VERSION
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const metadata: Metadata = {
  title: "Crime Dashboard - Peta Kriminalitas Morowali",
  description: "Dashboard interaktif untuk monitoring kriminalitas di Morowali",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css"
        />
        <script
          src="https://unpkg.com/leaflet/dist/leaflet.js"
          async
        ></script>
      </head>

      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}