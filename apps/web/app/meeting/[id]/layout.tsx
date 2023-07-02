export const metadata = {
  title: "Meeting",
  description: "Video and audio meeting",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main>{children}</main>;
}
