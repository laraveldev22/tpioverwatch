"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import axios from "axios";
import { FiArrowDown, FiArrowUp, FiEye, FiSearch } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { RiArrowUpDownFill } from "react-icons/ri";

interface Article {
    id: string;
    title: string;
    category: string;
    byline: string;
    is_newsletter: boolean; // Published / Draft
    created_at: string;
    updated_at: string;
}

const articleCategories = {
    A: "Feature Story",
    B: "Data/Report Summary",
    C: "Events & Commemoration",
    D: "Historical or Cultural Insight",
};

const ArticlesPage = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortConfig, setSortConfig] = useState<{
        key: keyof Article | "status" | "category" | "title" | "byline";
        direction: "asc" | "desc";
    } | null>(null);

    const itemsPerPage = 10;

    // Fetch from API
    const fetchArticles = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const params: any = {
                page: currentPage,
                page_size: itemsPerPage,
            };

            // Add search query if exists
            if (search) params.search = search;

            // Add ordering if sort is active
            if (sortConfig) {
                const orderPrefix = sortConfig.direction === "desc" ? "-" : "";
                params.ordering = `${orderPrefix}${sortConfig.key}`;
            }

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/articles/`,
                {
                    headers: { Authorization: `Token ${token}` },
                    params,
                }
            );

            setArticles(response?.data?.results?.results || []);
            setTotalPages(Math.ceil((response?.data?.count || 0) / itemsPerPage));
        } catch (error) {
            console.error("Error fetching articles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
        // Re-run whenever search, page, or sort changes
    }, [search, currentPage, sortConfig]);

    // Sorting arrows
    const getSortArrow = (key: string) => {
        if (sortConfig?.key === key) {
            return sortConfig.direction === "asc" ? (
                <FiArrowUp className="inline ml-1" />
            ) : (
                <FiArrowDown className="inline ml-1" />
            );
        }
        return <RiArrowUpDownFill className="inline ml-1 text-gray-300" />;
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-[#171a39] capitalize">
                    Articles List
                </h2>

                <div className="relative max-w-sm w-full">
                    <input
                        type="search"
                        placeholder="Search articles..."
                        value={search}
                        onChange={(e) => {
                            setCurrentPage(1); // reset to page 1 on new search
                            setSearch(e.target.value);
                        }}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e8be5a] focus:border-[#e8be5a] transition"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <FiSearch className="h-5 w-5" />
                    </span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white shadow rounded-lg w-full">
                {loading ? (
                    <div className="flex justify-center items-center py-10 h-full">
                        <Loader2 className="animate-spin h-8 w-8 text-[#e8be5a]" />
                    </div>
                ) : articles?.length === 0 ? (
                    <div className="flex justify-center items-center py-10 text-gray-500">
                        No articles found.
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                        <thead className="bg-[#171a39] text-white">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-sm font-medium uppercase cursor-pointer"
                                    onClick={() =>
                                        setSortConfig({
                                            key: "title",
                                            direction:
                                                sortConfig?.key === "title" &&
                                                    sortConfig.direction === "asc"
                                                    ? "desc"
                                                    : "asc",
                                        })
                                    }
                                >
                                    Title {getSortArrow("title")}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-sm font-medium uppercase cursor-pointer"
                                    onClick={() =>
                                        setSortConfig({
                                            key: "category",
                                            direction:
                                                sortConfig?.key === "category" &&
                                                    sortConfig.direction === "asc"
                                                    ? "desc"
                                                    : "asc",
                                        })
                                    }
                                >
                                    Category {getSortArrow("category")}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-sm font-medium uppercase cursor-pointer"
                                    onClick={() =>
                                        setSortConfig({
                                            key: "status",
                                            direction:
                                                sortConfig?.key === "status" &&
                                                    sortConfig.direction === "asc"
                                                    ? "desc"
                                                    : "asc",
                                        })
                                    }
                                >
                                    Status {getSortArrow("status")}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-sm font-medium uppercase cursor-pointer"
                                    onClick={() =>
                                        setSortConfig({
                                            key: "byline",
                                            direction:
                                                sortConfig?.key === "byline" &&
                                                    sortConfig.direction === "asc"
                                                    ? "desc"
                                                    : "asc",
                                        })
                                    }
                                >
                                    Byline {getSortArrow("byline")}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-sm font-medium uppercase cursor-pointer"
                                    onClick={() =>
                                        setSortConfig({
                                            key: "created_at",
                                            direction:
                                                sortConfig?.key === "created_at" &&
                                                    sortConfig.direction === "asc"
                                                    ? "desc"
                                                    : "asc",
                                        })
                                    }
                                >
                                    Created {getSortArrow("created_at")}
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-sm font-medium uppercase cursor-pointer"
                                    onClick={() =>
                                        setSortConfig({
                                            key: "updated_at",
                                            direction:
                                                sortConfig?.key === "updated_at" &&
                                                    sortConfig.direction === "asc"
                                                    ? "desc"
                                                    : "asc",
                                        })
                                    }
                                >
                                    Updated {getSortArrow("updated_at")}
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium uppercase">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {articles && articles?.map((article) => (
                                <tr
                                    key={article.id}
                                    className="hover:bg-[#fef3c7] transition-colors duration-200 cursor-pointer"
                                >
                                    <td
                                        className="px-6 py-4 text-sm text-gray-700 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
                                        onClick={() =>
                                            window.open(`/article-view?id=${article.id}`, "_blank")
                                        }
                                    >
                                        {article.title}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 truncate">
                                        {articleCategories[
                                            article.category as keyof typeof articleCategories
                                        ] || article.category}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span
                                            className={`px-2 py-1 rounded-full text-white font-semibold text-xs ${article.is_newsletter ? "bg-green-500" : "bg-yellow-500"
                                                }`}
                                        >
                                            {article.is_newsletter ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 truncate">
                                        {article.byline}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 truncate">
                                        {new Date(article.created_at).toLocaleString("en-GB", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 truncate">
                                        {new Date(article.updated_at).toLocaleString("en-GB", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 flex gap-2 justify-center">
                                        <button
                                            onClick={() =>
                                                window.open(`/article-view?id=${article.id}`, "_blank")
                                            }
                                            className="text-blue-600 hover:text-blue-800 transition"
                                            title="View"
                                        >
                                            <FiEye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
                        onClick={() =>
                            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                        }
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
