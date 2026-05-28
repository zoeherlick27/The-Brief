export const metadata = {
  title: "The Brief — Intelligence Tracker",
  description: "Live industry intelligence for tech/AI and food & hospitality",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
