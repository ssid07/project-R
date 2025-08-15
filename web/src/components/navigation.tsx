"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package, Plus, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Products",
    href: "/dashboard",
    icon: Package,
  },
  {
    title: "Add Product",
    href: "/dashboard/products/new",
    icon: Plus,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Package className="h-6 w-6" />
        <span className="ml-2 text-lg font-semibold">Product Inventory</span>
      </div>
      <div className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                isActive && "bg-secondary"
              )}
              asChild
            >
              <Link href={item.href}>
                <Icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}