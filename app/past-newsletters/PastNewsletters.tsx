"use client";
import { useState, useEffect } from "react";
import { Mail, Phone, Printer, Globe, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import axios from "axios";

interface FullArticle {
  id: string;
  title: string;
  byline: string;
  lead_paragraph: string;
  created_at: string;
  tags: string;
  message: string;
  message_description: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  category: string;
  byline: string;
  is_newsletter: boolean;
  created_at: string;
  updated_at: string;
}


function PastNewsletters() {
  const [groupedArticles, setGroupedArticles] = useState<
    Record<string, FullArticle[]>
  >({});
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 2; // show 2 months per page

  const fetchNewsletters = async () => {
    
    setLoading(true);
     

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/newsletters/grouped/`,
        
      );
      setGroupedArticles(response.data);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletters();
  }, []);

  // Convert groupedArticles into sorted month-year keys
  const monthKeys = Object.keys(groupedArticles).sort((a, b) =>
    b.localeCompare(a)
  );

  const totalPages = Math.ceil(monthKeys.length / pageSize);

  const paginatedKeys = monthKeys.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <header className="bg-[#171a39] text-white px-6 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold font-serif">Past Newsletters</h1>
          <img src="/mainLogo.png" alt="Logo" className="h-16" />
        </header>

        {/* Article List */}
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6 text-gray-800">
            📌 Available Newsletters
          </h2>

          {loading && (
            <div className="flex items-center justify-center space-x-2 p-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-gray-700 font-medium">Loading newsletters...</span>
            </div>
          )}

          {!loading &&
            paginatedKeys.map((monthYear) => (
              <div
                key={monthYear}
                className="mb-10 bg-[#f5f6fa] rounded-xl shadow-sm border border-[#e0e0e7] p-4"
              >
                {/* Month Title */}
                <div className="bg-[#171a39] text-white px-4 py-2 rounded-t-xl mb-4">
                  <h3 className="text-lg font-semibold">{monthYear}</h3>
                </div>

                {/* Articles Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedArticles[monthYear].map((article) => (
                    <div
                      key={article.id}
                      className="bg-white border border-gray-200 rounded-lg shadow-md p-4 flex flex-col justify-between hover:shadow-xl transition-shadow"
                    >
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 hover:text-[#171a39] transition-colors">
                          {article.title}
                        </h4>
                        <p className="text-sm text-gray-500">{article.message}</p>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                          {article.message_description}
                        </p>
                      </div>
                      <div className="mt-4 text-xs text-gray-500 italic">
                        {new Date(article.created_at).toLocaleDateString("en-AU")}{" "}
                        {article.tags}
                      </div>
                      <Link
                        href={`/past-newsletters/${article.slug}`}
                        className="mt-3 inline-block text-sm font-medium text-white bg-[#171a39] px-4 py-2 rounded-md hover:bg-[#0f1225] transition-colors"
                      >
                        Read →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {/* Pagination Controls */}
          {
            !loading && <div className="flex justify-center items-center space-x-4 mt-6">
              {/* Previous Button */}
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 shadow-sm ${currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#171a39] text-white hover:bg-[#0f1225] hover:scale-105"
                  }`}
              >
                <ChevronLeft size={18} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Indicator */}
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-lg shadow-sm">
                Page {currentPage} of {totalPages}
              </span>

              {/* Next Button */}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 shadow-sm ${currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#171a39] text-white hover:bg-[#0f1225] hover:scale-105"
                  }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={18} />
              </button>
            </div>}

        </div>

        {/* Footer */}
        <footer className="bg-[#171a39] text-white p-6 flex justify-between items-center">
          <div className="space-y-2 text-sm">
            <p>Veterans Overwatch</p>
            <p>171 Richmond Rd, Richmond SA 5033</p>
            <p className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>(08) 8351 8140</span>
            </p>
            <p className="flex items-center space-x-2">
              <Printer className="h-4 w-4" />
              <span>(08) 8351 7781</span>
            </p>
            <p className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>office@tpi-sa.com.au</span>
            </p>
            <p className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <a
                href="https://tpi-sa.com.au"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                https://tpi-sa.com.au
              </a>
            </p>
          </div>
          <img src="/mainLogo.png" alt="Logo" className="h-16" />
        </footer>
      </div>
    </div>
  );
}

export default PastNewsletters;
