export const metadata = {
  title: "Meeting",
  description: "Video and audio meeting",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="p-4 sm:p-8 h-screen w-screen">{children}</div>;
}
