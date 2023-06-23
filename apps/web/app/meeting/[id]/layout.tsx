export const metadata = {
  title: "Meeting",
  description: "Video and audio meeting",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-screen w-screen p-4 pb-8 sm:p-8">{children}</div>;
}
