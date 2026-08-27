import "./globals.css";

export const metadata = {
  title: "Study Hub",
  description: "Video lectures and notes, all in one place"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
