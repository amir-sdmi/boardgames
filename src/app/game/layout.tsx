import React from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      style={{
        backgroundColor: "#FFECCF",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {children}
    </div>
  );
}
