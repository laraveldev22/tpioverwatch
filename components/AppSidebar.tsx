"use client"

import Image from "next/image"
import { Home, Archive, User, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export default function AppSidebar({ setChatMessage }: { setChatMessage: (message: string) => void }) {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <Image src="/logo.svg" alt="TPI Logo" width={180} height={80} className="mx-auto" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start" asChild>
                  <Link href="/dashboard">
                    <span>
                      <Home className="w-4 h-4 mr-2" />
                    </span>
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start" asChild>
                  <Link href="/articles">
                    <span>
                      <Archive className="w-4 h-4 mr-2" />
                    </span>
                    <span>Article List</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start" asChild>
                  <Link href="/archive">
                    <span>
                      <Archive className="w-4 h-4 mr-2" />
                    </span>
                    <span>Archive</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center space-x-3 p-2 bg-[#1e4a72] rounded-lg text-white">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-[#1e4a72]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Anita Cruz</p>
            <p className="text-xs text-blue-200 truncate">anita@overwatch.com</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-600">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}