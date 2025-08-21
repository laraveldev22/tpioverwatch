"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import axios from "axios";
import { FiSearch } from "react-icons/fi";
import { Loader2 } from "lucide-react";

interface Article {
    id: string;
    title: string;
    category: string;
    byline: string;
    is_newsletter: boolean; // for Published / Draft
    created_at: string;
    updated_at: string;
}

const ArticlesPage = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Fetch articles from API
    const fetchArticles = async () => {
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/articles/?is_newsletter=true`,
                {
                    headers: { Authorization: `Token ${token}` },
                }
            );
            setArticles(response?.data?.results?.results);
        } catch (error) {
            console.error("Error fetching articles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    // Filtered articles
    const filteredArticles: Article[] = Array.isArray(articles)
        ? articles.filter((article) =>
            article.title.toLowerCase().includes(search.toLowerCase())
        )
        : [];

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedArticles = filteredArticles.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold text-[#171a39] capitalize">Archive List</h2>

                <div className="relative max-w-sm w-full">
                    <input
                        type="text"
                        placeholder="Search articles..."
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
                ) : filteredArticles.length === 0 ? (
                    <div className="flex justify-center items-center py-10 text-gray-500">
                        No articles found.
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                        <thead className="bg-[#171a39] text-white">
                            <tr>
                                <th className="w-1/4 px-6 py-3 text-left text-sm font-medium uppercase">Title</th>
                                <th className="w-1/6 px-6 py-3 text-left text-sm font-medium uppercase">Category</th>
                                <th className="w-1/6 px-6 py-3 text-left text-sm font-medium uppercase">Status</th>
                                <th className="w-1/6 px-6 py-3 text-left text-sm font-medium uppercase">Byline</th>
                                <th className="w-1/6 px-6 py-3 text-left text-sm font-medium uppercase">Created</th>
                                <th className="w-1/6 px-6 py-3 text-left text-sm font-medium uppercase">Updated</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedArticles.map((article) => (
                                <tr
                                    key={article.id}
                                    className="hover:bg-[#fef3c7] transition-colors duration-200 cursor-pointer"
                                >
                                    <td className="px-6 py-4 text-sm text-gray-700 truncate">{article.title}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 truncate">{article.category}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span
                                            className={`px-2 py-1 rounded-full text-white font-semibold text-xs ${article.is_newsletter ? "bg-green-500" : "bg-yellow-500"
                                                }`}
                                        >
                                            {article.is_newsletter ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 truncate">{article.byline}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 truncate">
                                        {new Date(article.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 truncate">
                                        {new Date(article.updated_at).toLocaleDateString()}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {filteredArticles.length > itemsPerPage && (
                <div className="flex justify-end mt-4 gap-2">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span className="px-3 py-1">{currentPage} / {totalPages}</span>
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
