"use client";

import { ReactNode, useEffect, useState } from "react";
import { FaBars, FaUserCircle, FaHome, FaSignOutAlt, FaArchive, FaFileAlt, FaCog } from "react-icons/fa";
import { Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';
import Cookies from "js-cookie";
import {  FaRegNewspaper } from "react-icons/fa";

 
interface DashboardLayoutProps {
  children?: ReactNode;
  getPrompts?: (value: string) => void
}

interface ConversationTitle {
  id: string;
  title: string;
  created_at: string;
}

export default function DashboardLayout({ children, getPrompts }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const route = useRouter()
  const pathname = usePathname();

  // Mock data
  const [sources, setSources] = useState([
    {
      name: "Department of Veteran Affairs (DVA)",
      time: "07-08-2025 13:50",
      endpoint: `/scrapers/dva/run/`,
    },
    {
      name: "Australian War Memorial (AWM)",
      time: "07-08-2025 13:50",
      endpoint: `/scrapers/awm/run/`,
    },
    {
      name: "Repatriation Medical Authority (RMA)",
      time: "07-08-2025 13:50",
      endpoint: `/scrapers/rma/run/`,
    },
    {
      name: "The Pineapple Express (TPE)",
      time: "07-08-2025 13:50",
      endpoint: `/scrapers/tpe/run/`,
    },
  ]);

  const [conversationLoading, setConversationLoading] = useState(false);
  const [sourceLoading, setSourceLoading] = useState<{ [key: string]: boolean }>({
    "Department of Veteran Affairs (DVA)": false,
    "Australian War Memorial (AWM)": false,
    "Repatriation Medical Authority (RMA)": false,
    "The Pineapple Express (TPE)": false,
  });

  const [conversationTitles, setConversationTitles] = useState<ConversationTitle[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [conversationError, setConversationError] = useState<string | null>(null);

  // Menu configuration
  const menuItems = [
    { name: "Home", icon: <FaHome />, path: "/dashboard" },
    { name: "Article List", icon: <FaFileAlt />, path: "/articles" },
    { name: "Archive", icon: <FaArchive />, path: "/archives" },
  ];
  const handleSyncClick = async (sourceName: string, endpoint: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found for sync");
      return;
    }

    setSourceLoading((prev) => ({ ...prev, [sourceName]: true }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          console.error("Authentication failed. Please log in again.");
          return;
        }
        throw new Error("Failed to sync data");
      }

      const data = await response.json();
      console.log(`Response for ${sourceName}:`, data);

      if (data.success && data.completed === data.total) {
        const now = new Date();
        const formattedTime = now.toLocaleString("en-AU", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        setSources((prev) => {
          const updatedSources = prev.map((source) =>
            source.name === sourceName ? { ...source, time: formattedTime } : source
          );
          localStorage.setItem("syncedSources", JSON.stringify(updatedSources));
          return updatedSources;
        });
        setSourceLoading((prev) => ({ ...prev, [sourceName]: false }));
      }
    } catch (err) {
      console.error(`Error syncing ${sourceName}:`, err);
    } finally {
      if (sourceLoading[sourceName]) {
        setSourceLoading((prev) => ({ ...prev, [sourceName]: false }));
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    Cookies.remove("token")
    window.location.href = "/";
  };

  const fetchConversationTitles = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setConversationLoading(true);
    setConversationError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/conversations/titles/`, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          return;
        }
        throw new Error("Failed to fetch conversation titles");
      }

      const data = await response.json();
      setConversationTitles(data);
    } catch (err) {
      setConversationError("Error loading conversation titles");
      console.error("Error fetching conversation titles:", err);
    } finally {
      setConversationLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
    fetchConversationTitles();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-[#171a39] text-white w-72 shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:flex-shrink-0 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-2 border-b border-gray-700">
          <Image src="/mainLogo.png" alt="Logo" width={150} height={32} />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto  px-3 py-4 space-y-6">
          {/* Home */}
          <div className="space-y-3   py-4">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => route.push(item.path)}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition
              ${isActive ? "bg-[#e8be5a] text-black" : "bg-[#004682] text-white hover:bg-[#003366]"}
            `}
                >
                  {item.icon}
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Sources */}
          <div>
            <p className="text-sm font-semibold text-gray-200 mb-2">Sources</p>
            <div className="space-y-2">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-[#1f234b] rounded hover:bg-[#24294f]"
                >
                  <div>
                    <p className="text-xs font-medium">{source.name}</p>
                    <p className="text-xs text-gray-400">
                      Last Sync: {source.time}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSyncClick(source.name, source.endpoint)}
                    disabled={sourceLoading[source.name]}
                    className={`w-7 h-7 flex items-center justify-center rounded ${sourceLoading[source.name]
                      ? "bg-blue-200"
                      : "bg-[#004682] hover:bg-[#003366]"
                      }`}
                  >
                    {sourceLoading[source.name] ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Conversations */}
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3">Article Threads</p>
            <div className="space-y-2">
              {conversationTitles.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 bg-[#1f234b] rounded-lg cursor-pointer 
                   hover:bg-[#24294f] hover:scale-105 transition-all duration-200 ease-in-out
                   border-l-4 border-transparent hover:border-blue-500 shadow-sm hover:shadow-lg"
                  title={c.title} // Shows full title on hover
                >
                  <p className="text-sm text-gray-200 font-medium truncate">{c.title}</p>
                  <div className="flex items-center gap-2">
                    {/* Optional icon */}
                    <svg
                      className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6 2a1 1 0 00-1 1v14l6-4 6 4V3a1 1 0 00-1-1H6z" />
                    </svg>
                    <span className="text-xs text-gray-400">{/* Optional date/time */}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompts */}
          <div>
            <p className="text-sm font-semibold text-gray-200 mb-2">
              Predefined Prompts
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Any upcoming events?",
                "Summarize top concerns among veterans",
                "Shorten the lead paragraph",
              ].map((prompt, i) => (
                <span
                  key={i}
                  onClick={() => getPrompts && getPrompts(prompt ?? "")}
                  className="px-2 py-1 text-xs bg-[#1f234b] text-gray-200 rounded cursor-pointer hover:bg-[#24294f]"
                >
                  {prompt}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Logout at Bottom */}
        <div className="p-4 border-t border-gray-700 flex flex-col gap-4">
          <button
            onClick={() => route.push("/frequency")}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            <FaRegNewspaper /> Newsletter Settings
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white shadow px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              title="menu"
              className="text-gray-700 mr-2 md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <FaBars size={24} />
            </button>
            <h1 className="text-xl font-semibold capitalize">
              {pathname.replace("/dashboard", "").replace("/", "") || "Home"}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span>{userData?.username}</span>
            <FaUserCircle size={24} />

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children ?? <div className="text-gray-500">Your content goes here...</div>}
        </main>
      </div>
    </div>
  );
}
