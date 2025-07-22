"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Box, Home, Package, Settings, Truck, Users, Tag, BarChart3, Menu, Bell, Search, Package2, ShoppingCart } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
// Importar los nuevos componentes de autenticación
import { UserMenu } from "@/components/auth/user-menu"


export function DashboardLayout({ children, role }: { children: React.ReactNode, role?: string }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 px-2">
            {/* <Box className="h-6 w-6 flex-shrink-0" /> */}
            <img src="/Logo-DOF1-768x552.png" alt="logo" className="h-6 w-8 group-data-[collapsible=icon]:hidden" />
            <span className="text-lg font-bold group-data-[collapsible=icon]:hidden">ERP TotalMotors</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/"} tooltip="Dashboard">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/productos")} tooltip="Productos">
                <Link href="/productos">
                  <Package className="h-4 w-4" />
                  <span>Productos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {
              role === "admin" && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/usuarios")} tooltip="Usuarios">
                      <Link href="/usuarios">
                        <Users className="h-4 w-4" />
                        <span>Usuarios</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/reportes")} tooltip="Reportes">
                      <Link href="/reportes">
                        <BarChart3 className="h-4 w-4" />
                        <span>Reportes</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/sku")} tooltip="SKU Manager">
                      <Link href="/sku">
                        <Settings className="h-4 w-4" />
                        <span>SKU Manager</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )
            }

          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="flex items-center justify-center group-data-[collapsible=icon]:px-0">
            <ModeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <SidebarTrigger />
          <div className="ml-auto flex items-center gap-2">
            <UserMenu />
          </div>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
