"use client";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
 import axios from 'axios';

interface FullArticle {
    id: string;
    title: string;
    content: string;
    category: string;
    is_newsletter: boolean;
    created_at: string;
    byline: string;
    lead_paragraph: string;
    key_facts: string | string[];
    quote_block: string;
    cta: string;
    tags: string;
    image_url: string;
    is_auto_generated?: boolean;
    conversation_session?: string;
    cta_url?:string;
}


function ArticleView() {
    const [publishedArticles, setPublishedArticles] = useState<FullArticle[]>([]);
    const [articleIds, setArticleIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [editableTitle, setEditableTitle] = useState("TPI Newsletter");
    const [editableMessageTitle, setEditableMessageTitle] = useState("Editor's Message");
    const [editableMessage, setEditableMessage] = useState(
        "Welcome to our newsletter — a space dedicated to informing, honouring, and connecting Australia’s totally and permanently incapacitated veterans, along with their families and support networks. Each edition is crafted to share trusted updates, celebrate service, and preserve the stories that define our community. Thank you for allowing us to be part of your journey."
    );
    const [newsLetterNo, setNewsLetterNo] = useState("")
    const searchParams = useSearchParams();
    const id = searchParams.get("id"); // ✅ get slug from query
    const currentDate = new Date();

    const formatKeyFacts = (keyFacts: string | string[] | undefined): string[] => {
        if (!keyFacts) return [];
        if (Array.isArray(keyFacts)) {
            return keyFacts.filter((fact) => fact.trim()).map((fact) => fact.trim());
        }
        try {
            const parsed = JSON.parse(keyFacts);
            if (Array.isArray(parsed)) {
                return parsed.filter((fact: string) => fact.trim()).map((fact: string) => fact.trim());
            }
        } catch {
            return keyFacts.split("\n").filter((fact) => fact.trim()).map((fact) => fact.trim());
        }
        return [];
    };

    const currentDateFormatted = currentDate.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/articles/latest/`,
                {
                    headers: { Authorization: `Token ${token}` },
                }
            );

            const newsletter = response?.data.results;
            if (!newsletter) {
                setPublishedArticles([]);
                setArticleIds([]);
                return;
            }

            const transformedArticles = newsletter.map((article: any) => ({
                id: article.id,
                title: article.title || "Untitled",
                byline: article.byline || "",
                lead_paragraph: article.lead_paragraph || "",
                content: article.content || "",
                image_url: article.image_url || "",
                key_facts: formatKeyFacts(article.key_facts || ""),
                quote_block: article.quote_block || "",
                tags: article.tags || "",
                created_at:
                    article.updated_at ||
                    article.created_at ||
                    new Date().toISOString(),
                cta: article.cta || "",
                cta_url: article.cta_url || ""
            }));

            // ✅ id से match करो (searchParams से जो आया है)
            const filtered = id
                ? transformedArticles.filter((a: any) => a.id === id)
                : transformedArticles;

            const allArticleIds = filtered.map((a: any) => a.id);
            setArticleIds(allArticleIds);
            setPublishedArticles(filtered);

            // अगर newsletter root पर है तो ये safe check
            if (newsletter.title) setEditableTitle(newsletter.title);
            if (newsletter.message) setEditableMessageTitle(newsletter.message);
            if (newsletter.message_description)
                setEditableMessage(newsletter.message_description);
            if (newsletter.newsletter_no) setNewsLetterNo(newsletter.newsletter_no);
        } catch (error: any) {
            console.error("Error fetching articles:", error?.response?.data || error.message);
            setPublishedArticles([]);
            setArticleIds([]);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchArticles();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center space-y-4">
                    <svg className="animate-spin h-16 w-16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#171a39" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="#171a39" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <p className="text-lg font-semibold" style={{ color: "#171a39" }}>Loading articles...</p>
                </div>
            </div>
        );
    }

    if (publishedArticles.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <p className="text-xl font-semibold text-gray-600">🚫 No articles available</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto bg-white border-1 border-blue-900 shadow-xl">
                {/* <header className="bg-[#171a39] text-white px-6 py-8 pb-11 flex justify-between rounded-lg items-center">
                    <img src="/mainLogo.png" alt="Logo" className="h-24" />
                    <div className="flex-1 text-center">
                        <h1 className="text-5xl text-center font-bold font-serif">{editableTitle}</h1>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold">{currentDateFormatted}</span>
                        <span className="text-lg mt-3 font-medium text-gray-300 uppercase">{newsLetterNo}</span>
                    </div>
                </header> */}

                <div className="p-6">
                    {/* <section className="mb-8 p-0 rounded-lg">
                        <h2
                            className="text-2xl font-bold mb-4 text-gray-800 cursor-text"
                            title="Click to edit"
                        >
                            {editableMessageTitle ?? "N/A"}
                        </h2>

                      

                        <p
                            className="text-lg text-gray-700 leading-relaxed cursor-text"
                            title="Click to edit"
                        >
                            {editableMessage ?? "N/A"}
                        </p>

                    </section> */}

                    {/* <hr className="border-t-2 border-gray-300 mb-8" /> */}
                    {/* Issue at a glance */}
                    <section className="mb-8">
                        {/* <div className="bg-[#171a39] text-white px-3 py-3 rounded-lg w-fit">
                            <h2 className="text-2xl font-bold">This Issue at a Glance</h2>
                        </div> */}
                        {/* <div className="bg-blue-50 p-6 mt-3 rounded-lg">
                            <ul className="space-y-3">
                                {publishedArticles.map((article) => (
                                    <li key={article.id} className="flex items-center">
                                        <svg
                                            className="w-5 h-4 mr-3 flex-shrink-0 transform rotate-45 align-middle"
                                            fill="none"
                                            stroke="#132A36"
                                            viewBox="0 0 8 8"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 4h5M4 1l3 3-3 3" />
                                        </svg>
                                        <span className="text-lg text-gray-800  ">{article.title}</span>
                                    </li>
                                ))}
                                {articleIds.length < 3 &&
                                    Array.from({ length: 3 - articleIds.length }).map((_, index) => (
                                        <li key={`empty-${index}`} className="flex items-center">
                                            <svg
                                                className="w-5 h-4 mr-3 flex-shrink-0 transform rotate-45 align-middle"
                                                fill="none"
                                                stroke="#A0AEC0"
                                                viewBox="0 0 8 8"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 4h5M4 1l3 3-3 3" />
                                            </svg>
                                            <span className="text-lg text-gray-500">Article Slot {articleIds.length + index + 1}: Empty</span>
                                        </li>
                                    ))}
                            </ul>
                        </div> */}
                    </section>

                    {/* <hr className="border-t-2 border-gray-300 mb-8" /> */}

                    {/* Articles */}
                    <div className="max-w-7xl mx-auto">
                        {publishedArticles.map((article) => (
                            <div key={article.id} className="mb-12">
                                <div className="mb-4">
                                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">{article.title}</h2>
                                </div>

                                {article.image_url && (
                                    <div className="mb-6 relative">
                                        <img src={article.image_url} alt={`Article ${article.id} Hero`} className="w-full h-56 object-cover rounded-lg shadow-md" />
                                    </div>
                                )}

                                <div className="mb-6">
                                    <p className="text-gray-600 italic">{article.byline}</p>
                                </div>

                                <div className="mb-6">
                                    <p className="text-lg font-bold text-gray-800 leading-relaxed">{article.lead_paragraph}</p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 text-justify">
                                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">{article.content}</div>
                                    </div>
                                    <div className="lg:col-span-1 space-y-6">
                                        <div className="bg-gray-100 shadow-md rounded-lg border border-gray-200 overflow-hidden">
                                            <div className="bg-gray-200 px-4 py-3 border-b border-gray-200">
                                                <h3 className="font-bold text-gray-800">Key Facts</h3>
                                            </div>
                                            <div className="p-4">
                                                {formatKeyFacts(article.key_facts).length > 0 ? (
                                                    <ul className="space-y-2 list-disc pl-5">
                                                        {formatKeyFacts(article.key_facts).map((fact, idx) => (
                                                            <li key={idx} className="text-sm text-gray-700 leading-relaxed">{fact}</li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-sm text-gray-500">No key facts available.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                                            <div className="p-4">
                                                <blockquote className="text-sm italic text-gray-700 relative">
                                                    <span className="text-3xl text-[#004682] absolute -top-2 -left-1">"</span>
                                                    <span className="pl-6 block">{article.quote_block}</span>
                                                    <span className="text-3xl text-[#004682] absolute -bottom-2 -right-1">"</span>
                                                </blockquote>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                        <div className="flex items-center space-x-4">
                                            <span>Topic: {article.tags}</span>
                                            <span>
                                                {article.created_at
                                                    ? new Date(article.created_at).toLocaleDateString("en-AU", { year: "numeric", month: "2-digit", day: "2-digit" })
                                                    : new Date().toLocaleDateString("en-AU", { year: "numeric", month: "2-digit", day: "2-digit" })}
                                            </span>
                                            <span>Source: TPI News</span>
                                        </div>
                                        <div>
                                            <a href={article.cta_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                {article.cta}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* <hr className="border-t-2 border-gray-300 mt-8" /> */}
                            </div>
                        ))}

                        {/* <div className="bg-[#171a39] text-white p-6 rounded-lg flex flex-col md:flex-row justify-between items-center">

                            <div className="space-y-2">

                                <p className='text-lg'>Veterans Overwatch</p>
                                <p>171 Richmond Rd, Richmond SA 5033</p>

                                <p className="flex items-center space-x-2">
                                    <Phone className="h-5 w-5 text-white" />
                                    <span>Phone: (08) 8351 8140</span>
                                </p>

                                <p className="flex items-center space-x-2">
                                    <Printer className="h-5 w-5 text-white" />
                                    <span>Fax: (08) 8351 7781</span>
                                </p>

                                <p className="flex items-center space-x-2">
                                    <Mail className="h-5 w-5 text-white" />
                                    <span>Email: office@tpi-sa.com.au</span>
                                </p>

                                <p className="flex items-center space-x-2">
                                    <Globe className="h-5 w-5 text-white" />
                                    <a
                                        href="https://tpi-sa.com.au"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-white undefined hover:underline"
                                    >
                                        Website: https://tpi-sa.com.au
                                    </a>
                                </p>
                            </div>

                            <img src="/mainLogo.png" alt="Logo" className="h-24 mt-4 md:mt-0" />
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default ArticleView