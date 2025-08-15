import { Navigation } from "@/components/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}