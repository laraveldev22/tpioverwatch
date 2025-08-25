"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { FaBars, FaUserCircle, FaHome, FaSignOutAlt, FaArchive, FaFileAlt, FaCog, FaMagic, FaFileCsv } from "react-icons/fa";
import { Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';
import Cookies from "js-cookie";
import { FaRegNewspaper } from "react-icons/fa";
import axios from "axios";
import { ImSpinner2 } from "react-icons/im";
import { CgSpinner } from "react-icons/cg";


interface DashboardLayoutProps {
  children?: ReactNode;
  getPrompts?: (value: string) => void,
  refetch?: number
}
interface SourceStatus {
  source_key: string;
  source_name: string;
  last_synced_at: string; // ISO date string (e.g., "2025-08-24T11:32:57Z")
  csv_file: string;
}
interface ConversationTitle {
  id: string;
  title: string;
  created_at: string;
}

export default function DashboardLayout({ children, getPrompts, refetch }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const route = useRouter()
  const pathname = usePathname();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [status, setStatus] = useState<SourceStatus[] | null>(null);
  console.log(status, "status")

  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds passed
  const ESTIMATED_TIME = 15 * 60; // 15 mins in seconds

  const [conversationLoading, setConversationLoading] = useState(true);
  const [sourceLoading, setSourceLoading] = useState<{ [key: string]: boolean }>({
    "Department of Veteran Affairs (DVA)": false,
    "Australian War Memorial (AWM)": false,
    "Repatriation Medical Authority (RMA)": false,
    "The Pineapple Express (TPE)": false,
  });
  const menuRef = useRef(null);
  const [conversationTitles, setConversationTitles] = useState<ConversationTitle[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [conversationError, setConversationError] = useState<string | null>(null);
  const [fetchSourceStatusLoader, setFetchSourceStatusLoader] = useState(true)
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scrapers/${endpoint.toLowerCase()}/run/`, {
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

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const handleAutoGenerate = async () => {
    setConfirmOpen(false);
    setLoading(true);

    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auto-generate/article/3/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "blob", // if backend sends file
        }
      );

      console.log("Generated Articles:", response);

      // 🔽 File download trigger
      const blob = new Blob([response.data], { type: "application/pdf" }); // adjust MIME type
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `generated-articles-${new Date().toISOString()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // refresh UI
      route.refresh();
    } catch (err) {
      console.error("Error generating articles:", err);
    }
    setLoading(false);
  };
  const fetchSourceStatus = async () => {
    setFetchSourceStatusLoader(true)
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/sources/status`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });
      console.log(res.data, "res.data")
      setStatus(res.data.sources);

    } catch (err: any) {
      console.error("Error fetching source status:", err.response?.data || err.message);
    } finally {
      setFetchSourceStatusLoader(false)
    }
  };

  const fetchConversationTitles = async () => {
    setConversationLoading(true);

    const token = localStorage.getItem("token");
    if (!token) return;

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

  const handleDownloadCSV = (sourceName: string, sourceKey: string) => {
    // Example: Build CSV from the data in status
    // You can call an API here instead if backend gives CSV

    const source = status && status.find((s) => s.source_key === sourceKey);
    if (!source) return;

    // Define CSV headers
    const headers = ["Source Name", "Source Key", "Last Synced At"];

    // Define CSV row
    const rows = [
      [
        source.source_name,
        source.source_key,
        new Date(source.last_synced_at).toLocaleString("en-GB"),
      ],
    ];

    // Convert to CSV string
    const csvContent =
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${sourceName}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    console.log("runing")
    fetchConversationTitles();
  }, [refetch]);

  useEffect(() => {
    fetchSourceStatus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !(menuRef.current as HTMLElement).contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // timer effect
  useEffect(() => {
    let interval: any;
    if (loading) {
      setElapsed(0);
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);


  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 bg-[#171a39] text-white shadow-lg transform transition-transform duration-300 ease-in-out
  ${sidebarOpen ? "translate-x-0 w-72 z-20" : "-translate-x-full"} 
  md:translate-x-0 md:static md:flex-shrink-0 md:w-[20%] flex flex-col`}

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
              {fetchSourceStatusLoader ? (
                <div className="flex justify-center items-center py-10">
                  <ImSpinner2 className="animate-spin w-6 h-6 text-blue-400" />
                  <span className="ml-2 text-gray-300 text-sm">Loading...</span>
                </div>
              ) : (
                <>
                  {status?.map((source, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-[#1f234b] rounded hover:bg-[#24294f]"
                    >
                      <div>
                        <p className="text-xs font-medium">{source.source_name}</p>
                        <p className="text-xs text-gray-400">
                          Last Sync:{" "}
                          {new Date(source.last_synced_at).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Download CSV Button */}
                        <a
                          href={source.csv_file}
                          download
                          className="w-7 h-7 flex items-center justify-center rounded bg-green-600 hover:bg-green-700"
                          title="Download CSV"
                        >
                          <FaFileCsv className="w-4 h-4 text-white" />
                        </a>

                        {/* Sync Button */}
                        <button
                          onClick={() => handleSyncClick(source.source_name, source.source_key)}
                          disabled={sourceLoading[source.source_name]}
                          className={`w-7 h-7 flex items-center justify-center rounded ${sourceLoading[source.source_name]
                            ? "bg-blue-200"
                            : "bg-[#004682] hover:bg-[#003366]"
                            }`}
                        >
                          {sourceLoading[source.source_name] ? (
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}

            </div>
          </div>

          {/* Conversations */}

          <div>
            <p className="text-sm font-semibold text-gray-300 mb-3"> Recent Prompts</p>

            {conversationLoading ? ( // <-- add a loading state check
              <div className="flex justify-center items-center py-10">
                <ImSpinner2 className="animate-spin w-6 h-6 text-blue-400" />
                <span className="ml-2 text-gray-300 text-sm">Loading...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {[...new Map(conversationTitles.map((c) => [c.title, c])).values()].map(
                  (c) => {
                    const shortName =
                      c.title.length > 25 ? c.title.substring(0, 25) + "..." : c.title;

                    return (
                      <div
                        key={c.id}
                        onClick={() => getPrompts && getPrompts(c.title)}
                        className="flex items-center justify-between p-3 bg-[#1f234b] rounded-lg cursor-pointer 
                hover:bg-[#24294f] hover:scale-105 transition-all duration-200 ease-in-out
                border-l-4 border-transparent hover:border-blue-500 shadow-sm hover:shadow-lg group"
                        title={c.title}
                      >
                        <p className="text-sm text-gray-200 font-medium">{shortName}</p>
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6 2a1 1 0 00-1 1v14l6-4 6 4V3a1 1 0 00-1-1H6z" />
                          </svg>
                          <span className="text-xs text-gray-400">
                            {/* e.g. date/time */}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
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
            onClick={() => setConfirmOpen(true)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 
                   hover:scale-105 hover:shadow-lg transition-all duration-300 text-white px-4 py-2 rounded disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FaMagic /> Auto Generate
              </>
            )}
          </button>
          <button
            onClick={() => route.push("/setting")}
            className="w-full flex items-center justify-center gap-2 bg-[#004682] hover:bg-blue-700 text-white px-4 py-2 rounded"
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
      <div className="flex-1 flex flex-col w-[80%]">
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
            <h1 className="text-xl font-semibold">
              {(() => {
                const title =
                  pathname
                    .replace("/dashboard", "")
                    .replace("/", "")
                    .replace(/-/g, " ") || "Home";

                return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
              })()}
            </h1>


          </div>

          <div className="relative flex items-center space-x-4" ref={menuRef}>
            <div className="flex flex-col items-end">
              {/* Username */}
              <span className="capitalize font-medium text-gray-800">
                {userData?.username}
              </span>
              {/* Subtitle */}

            </div>

            {/* Profile Icon */}
            <button
              title="sad"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="relative text-gray-700 focus:outline-none"
            >
              <FaUserCircle size={28} />
            </button>

            {/* Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute -right-2 mt-2 w-40 bg-white border rounded-md shadow-lg top-8 z-50">
                {/* Arrow */}
                <div className="absolute -top-2 right-3 w-4 h-4 bg-white border-l border-t rotate-45"></div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      {confirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 text-center relative">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Are you sure?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Auto-generating articles may take <b>10–15 minutes</b> to finish.
              Do you want to start now?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 
                  rounded-lg text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAutoGenerate}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 
                  hover:scale-105 text-white rounded-lg font-medium shadow-md"
              >
                Yes, Start
              </button>
            </div>
          </div>
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center
          bg-black/40 backdrop-blur-md text-center px-4">
          <CgSpinner className="animate-spin text-white text-6xl mb-4" />
          <p className="text-lg font-medium text-white drop-shadow mb-2">
            Generating Articles...
          </p>

          {/* Progress Info */}
          <p className="text-sm text-gray-200">
            Elapsed: {formatTime(elapsed)} | Est. {formatTime(ESTIMATED_TIME - elapsed > 0 ? ESTIMATED_TIME - elapsed : 0)} left
          </p>

          {/* Optional progress bar */}
          <div className="w-64 bg-gray-700 rounded-full h-2 mt-3">
            <div
              className="bg-green-400 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min((elapsed / ESTIMATED_TIME) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
