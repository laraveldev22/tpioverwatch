"use client"

import { useState } from "react"
import Image from "next/image"
import { Search, MoreVertical, ChevronDown, User, Home, ShipIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import clsx from "clsx"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
// import Link from "next/link"

const articles = [
  {
    id: 1,
    title: "Tiger Nixon",
    tags: "Pensions...",
    priority: "High",
    tone: "Positive",
    sources: "DVA",
    status: "Draft",
    date: "Last 7 Days",
    wordCount: 356,
    avatar: null,
  },
  {
    id: 2,
    title: "Tiger Nixon",
    tags: "Pensions...",
    priority: "Medium",
    tone: "Positive",
    sources: "AMW",
    status: "Published",
    date: "Last 7 Days",
    wordCount: 509,
    avatar: null,
  },
  {
    id: 3,
    title: "Tiger Nixon",
    tags: "Pensions...",
    priority: "Low",
    tone: "Positive",
    sources: "DVA",
    status: "Published",
    date: "Last 7 Days",
    wordCount: 356,
    avatar: null,
  },
  {
    id: 4,
    title: "Tiger Nixon",
    tags: "Pensions...",
    priority: "Low",
    tone: "Positive",
    sources: "DVA",
    status: "Published",
    date: "Last 7 Days",
    wordCount: 356,
    avatar: null,
  },
  {
    id: 5,
    title: "Tiger Nixon",
    tags: "Pensions...",
    priority: "Low",
    tone: "Positive",
    sources: "AMW",
    status: "Published",
    date: "Last 2 weeks",
    wordCount: 356,
    avatar: null,
  },
  {
    id: 6,
    title: "Tiger Nixon",
    tags: "Pensions...",
    priority: "Medium",
    tone: "Positive",
    sources: "The Pineapple Express",
    status: "Published",
    date: "Last 2 weeks",
    wordCount: 356,
    avatar: null,
  },
  {
    id: 7,
    title: "Tiger Nixon",
    tags: "Pensions...",
    priority: "High",
    tone: "Positive",
    sources: "DVA",
    status: "Published",
    date: "Last 2 weeks",
    wordCount: 356,
    avatar: null,
  },
  {
    id: 8,
    title: "Tiger Nixon",
    tags: "Pensions...",
    priority: "Medium",
    tone: "Positive",
    sources: "AMW",
    status: "Published",
    date: "Last 2 weeks",
    wordCount: 356,
    avatar: null,
  },
  {
    id: 9,
    title: "Tiger Nixon",
    tags: "Pensions...",
    priority: "High",
    tone: "Positive",
    sources: "DVA",
    status: "Published",
    date: "Last month",
    wordCount: 356,
    avatar: null,
  },
  {
    id: 10,
    title: "Tiger Nixon",
    tags: "Pensions...",
    priority: "Medium",
    tone: "Positive",
    sources: "AMW",
    status: "Published",
    date: "Last month",
    wordCount: 356,
    avatar: null,
  },
  {
    id: 11,
    title: "Tiger Nixon",
    tags: "Pensions...",
    priority: "High",
    tone: "Positive",
    sources: "DVA",
    status: "Published",
    date: "Last month",
    wordCount: 356,
    avatar: null,
  },
]

function ArchiveSidebar() {
  const pathname = usePathname()
  return (
    <Sidebar className="border-r custom-scrollbar">
      <SidebarHeader className="p-4">
        <Image
          src="/Group 306.svg"
          alt="TPI Logo"
          width={180}
          height={80}
          className="mx-auto transition-transform duration-300 hover:scale-105"
        />
      </SidebarHeader>

      {/* Make all scrollable content in SidebarContent */}
      <SidebarContent className="custom-scrollbar">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* HOME */}
              <SidebarMenuItem>
                <SidebarMenuButton className="w-full justify-start bg-blue-100 text-blue-700 rounded-lg p-3 mb-2 transition-none">
                  <Link href="/dashboard">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                        <img src="/home.svg" alt="Home" className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Home</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* ARCHIVE */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="w-full justify-start text-gray-600 rounded-lg p-3 mb-2 transition-none"
                  asChild
                >
                  <Link href="/archive">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <img src="/e commerce.svg" alt="Archive" className="w-5 h-5 opacity-70" />
                      </div>
                      <span className="font-medium">Archive</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Filters */}
        {[
          {
            label: "Source",
            items: [
              { id: "dva", label: "DVA", checked: true },
              { id: "amw", label: "AMW", checked: true },
              { id: "pineapple", label: "The Pineapple Express", checked: false },
            ],
          },
          {
            label: "Alignment with Mission Areas",
            items: [
              { id: "advocacy", label: "Advocacy", checked: true },
              { id: "awareness", label: "Awareness", checked: true },
              { id: "policy", label: "Policy" },
              { id: "community", label: "Community" },
              { id: "commemoration", label: "Commemoration" },
            ],
          },
          {
            label: "Tone",
            items: [
              { id: "positive", label: "Positive", checked: true },
              { id: "neutral", label: "Neutral" },
              { id: "critical", label: "Critical" },
            ],
          },
        ].map(({ label, items }) => (
          <SidebarGroup key={label}>
            <Collapsible defaultOpen>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between p-2 text-sm font-medium transition-colors duration-200 hover:bg-gray-50">
                  {label}
                  <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent className="transition-all duration-300 ease-in-out">
                <SidebarGroupContent className="space-y-2 p-2">
                  {items.map(({ id, label, checked }) => (
                    <div key={id} className="flex items-center space-x-2">
                      <Checkbox
                        id={id}
                        defaultChecked={checked}
                        className="bg-transparent data-[state=checked]:bg-transparent border-gray-300"
                      />
                      <label htmlFor={id} className="text-sm">{label}</label>
                    </div>
                  ))}
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        ))}

        {/* Trending Topics */}
        <SidebarGroup>
          <Collapsible defaultOpen>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger className="flex w-full items-center justify-between p-2 text-sm font-medium transition-colors duration-200 hover:bg-gray-50">
                Trending Topics
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent className="transition-all duration-300 ease-in-out">
              <SidebarGroupContent className="space-y-2 p-2">
                {[
                  "Mental Health Support Initiatives",
                  "New Museum Exhibits at AWM",
                  "New Health Benefits for TPI Members",
                ].map((topic) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200"
                  >
                    {topic}
                  </Badge>
                ))}
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Move Footer Into Scrollable SidebarContent */}
        <SidebarGroup>
          <SidebarGroupContent className="p-4">
            <div className="flex items-center space-x-3 p-2 bg-[#1e4a72] rounded-lg text-white transition-all duration-200 hover:bg-[#1a3f63]">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-[#1e4a72]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Anita Cruz</p>
                <p className="text-xs text-blue-200 truncate">anita@overwatch.com</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-blue-600 transition-colors duration-200">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "High":
      return "text-red-600"
    case "Medium":
      return "text-yellow-600"
    case "Low":
      return "text-blue-600"
    default:
      return "text-gray-600"
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "Published":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>
    case "Draft":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Draft</Badge>
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export default function ArchivePage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <ArchiveSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <h1 className="text-2xl font-semibold text-gray-900">Article List</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search anything here..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="bg-white rounded-lg border">
              {/* Table Header */}
              <div className="grid grid-cols-9 gap-4 p-4 border-b bg-gray-100 font-serif text-1xl font-medium text-gray-700">
                <div>Title</div>
                <div>Tags</div>
                <div>Priority</div>
                <div>Tone</div>
                <div>Sources</div>
                <div>Status</div>
                <div>Date</div>
                <div>Word Count</div>
                <div>Action</div>
              </div>

              {/* Table Body */}
              <div className="divide-y">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="grid grid-cols-9 gap-9 p-4 items-center text-sm hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Link href={`/article/${article.id}`} className="flex items-center space-x-2 cursor-pointer">
                      {article.avatar && (
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                          {article.avatar}
                        </div>
                      )}
                      <span className="text-gray-900 hover:text-blue-600 transition-colors duration-200">
                        {article.title}
                      </span>
                    </Link>
                    <div className="text-gray-600">{article.tags}</div>
                    <div className={`font-medium ${getPriorityColor(article.priority)}`}>{article.priority}</div>
                    <div className="text-gray-600">{article.tone}</div>
                    <div className="text-gray-600">{article.sources}</div>
                    <div>{getStatusBadge(article.status)}</div>
                    <div className="text-gray-600">{article.date}</div>
                    <div className="text-gray-600">{article.wordCount || ""}</div>
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 duration-200"
                          >
                            <div className="h-4 w-4 bg-[#004682] p-3 rounded-md flex items-center justify-center">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                              >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                              </svg>
                            </div>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View</DropdownMenuItem>
                          <DropdownMenuItem>Publish</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      <style jsx global>{`
  /* HIDE scrollbar but keep scroll working */
  .custom-scrollbar {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
  }
  .custom-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  /* TRANSPARENT checkbox background + black tick */
  input[type="checkbox"] {
    accent-color: black !important;
    background-color: transparent !important;
  }
`}</style>
      <style jsx global>{`
  [data-state="checked"] svg {
    color: black !important;
    stroke: black !important;
    fill: black !important;
  }
`}</style>

    </SidebarProvider>
  )
}
