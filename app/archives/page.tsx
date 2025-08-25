"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import axios from "axios";
import { FiSearch, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { RiArrowUpDownFill } from "react-icons/ri";

interface Article {
  id: string;
  title: string;
  category: string;
  byline: string;
  is_newsletter: boolean;
  created_at: string;
  updated_at: string;
}

interface Newsletter {
  id: string;
  title: string;
  ad_hoc: boolean;
  newsletter_url: string;
  included_articles: Article[];
  created_at: string;
  updated_at: string;
  slug: string;
}

const ArticlesPage = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // 🔹 Sorting state
  const [sortKey, setSortKey] = useState<keyof Newsletter>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const itemsPerPage = 10;

  const fetchNewsletters = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/newsletters/publish/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setNewsletters(response.data);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const handleSort = (key: keyof Newsletter) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (key: keyof Newsletter) => {
    if (sortKey !== key) return <RiArrowUpDownFill className="inline h-4 w-4 ml-1" />;
    return sortOrder === "asc" ? (
      <FiArrowUp className="inline h-4 w-4 ml-1" />
    ) : (
      <FiArrowDown className="inline h-4 w-4 ml-1" />
    );
  };

  const filtered = newsletters.filter((nl) =>
    nl.title.toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 Apply sorting
  const sorted = [...filtered].sort((a, b) => {
    let valA: string | number | boolean = a[sortKey] as any;
    let valB: string | number | boolean = b[sortKey] as any;

    // Handle date fields
    if (sortKey === "created_at" || sortKey === "updated_at") {
      valA = new Date(a[sortKey] as string).getTime();
      valB = new Date(b[sortKey] as string).getTime();
    }

    // Handle string title
    if (sortKey === "title") {
      valA = (a.title || "").toLowerCase();
      valB = (b.title || "").toLowerCase();
    }

    // Handle boolean ad_hoc (true = 1, false = 0)
    if (sortKey === "ad_hoc") {
      valA = a.ad_hoc ? 1 : 0;
      valB = b.ad_hoc ? 1 : 0;
    }

    // Handle included_articles length
    if (sortKey === "included_articles") {
      valA = a.included_articles?.length || 0;
      valB = b.included_articles?.length || 0;
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });


  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-[#171a39] capitalize">Newsletter List</h2>
        <div className="relative max-w-sm w-full">
          <input
            type="search"
            placeholder="Search newsletters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e8be5a] focus:border-[#e8be5a] transition"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <FiSearch className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center py-10 h-full">
            <Loader2 className="animate-spin h-8 w-8 text-[#e8be5a]" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex justify-center items-center py-10 text-gray-500">
            No newsletters found.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-[#171a39] text-white">
              <tr>
                <th
                  onClick={() => handleSort("title")}
                  className="px-6 py-3 text-left text-sm font-medium uppercase cursor-pointer select-none"
                >
                  Title {renderSortIcon("title")}
                </th>
                <th
                  onClick={() => handleSort("ad_hoc")}
                  className="px-6 py-3 text-left text-sm font-medium uppercase cursor-pointer select-none"
                >
                  Special Newsletter {renderSortIcon("ad_hoc")}
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium uppercase">View</th>
                <th
                  onClick={() => handleSort("included_articles")}
                  className="px-6 py-3 text-left text-sm font-medium uppercase cursor-pointer select-none"
                >
                  Included Articles {renderSortIcon("included_articles")}
                </th>
                <th
                  onClick={() => handleSort("created_at")}
                  className="px-6 py-3 text-left text-sm font-medium uppercase cursor-pointer select-none"
                >
                  Created {renderSortIcon("created_at")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginated.map((nl) => (
                <tr
                  key={nl.id}
                  className="hover:bg-[#fef3c7] transition-colors duration-200"
                >
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {nl.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{nl.ad_hoc ? "Yes" : "No"}</td>
                  <td className="px-6 py-4 text-sm text-blue-600 underline truncate">
                    <button
                      onClick={() => window.open(`/newsletter?slug=${nl.slug}`, "_blank")}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <button
                      onClick={() =>
                        window.open(`/newsletter-articles?newsletter=${nl.id}`, "_blank")
                      }
                      className="px-3 py-1 bg-[#171a39] text-white rounded-lg text-xs hover:bg-[#2a2d55] transition"
                    >
                      View Articles ({nl.included_articles.length})
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 truncate">
                    {new Date(nl.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {sorted.length > itemsPerPage && (
        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ArticlesPage;
