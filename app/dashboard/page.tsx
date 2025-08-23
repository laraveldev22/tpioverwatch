'use client'
import React, { RefObject } from 'react'
import DashboardLayout from '../layout/DashboardLayout'
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Edit3, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation';
import { pdf } from "@react-pdf/renderer";
import ArticlePDF, { ArticlePDFProps } from './ArticlePDF';
import axios from 'axios';
import { FaEye, FaFilePdf, FaGripVertical, FaTrash } from 'react-icons/fa';
import { CgSpinner } from "react-icons/cg";

const articleCategories = {
    A: "Feature Story",
    B: "Data/Report Summary",
    C: "Events & Commemoration",
    D: "Historical or Cultural Insight",
}

interface Article {
    id: string
    title: string
    content?: string
    category?: string
    is_newsletter?: boolean
    created_at: string
    byline?: string
    lead_paragraph?: string
    key_facts?: string | string[]
    quote_block?: string
    cta?: string
    tags?: string
    image_url?: string
}

interface FullArticle extends Article {
    is_auto_generated?: boolean
    conversation_session?: string
    updated_at?: string
}

interface ChatMessage {
    role: "user" | "assistant"
    content: string
}
// Make the hook generic for any HTMLElement type
function useClickOutside<T extends HTMLElement>(ref: RefObject<T>, callback: () => void) {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, callback]);
}

const page = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentArticle, setCurrentArticle] = useState<FullArticle | null>(null);
    const [publishedArticleIds, setPublishedArticleIds] = useState<string[]>([]);
    const [articleSaving, setArticleSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("A");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingByline, setIsEditingByline] = useState(false);
    const [isEditingLeadParagraph, setIsEditingLeadParagraph] = useState(false);
    const [isEditingContent, setIsEditingContent] = useState(false);
    const [isEditingKeyFacts, setIsEditingKeyFacts] = useState(false);
    const [isEditingQuoteBlock, setIsEditingQuoteBlock] = useState(false);
    const [isEditingCta, setIsEditingCta] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedByline, setEditedByline] = useState("");
    const [editedLeadParagraph, setEditedLeadParagraph] = useState("");
    const [editedContent, setEditedContent] = useState("");
    const [editedKeyFacts, setEditedKeyFacts] = useState("");
    const [editedQuoteBlock, setEditedQuoteBlock] = useState("");
    const [editedCta, setEditedCta] = useState("");
    const [editedTags, setEditedTags] = useState("");
    const [loading, setLoading] = useState(false);
    const [articles, setArticles] = useState<Article[]>([]);
    const [newsletters, setNewsLetters] = useState<Article[]>([]);
    const titleRef = useRef<HTMLTextAreaElement>(null);
    const bylineRef = useRef<HTMLInputElement>(null);
    const leadParagraphRef = useRef<HTMLTextAreaElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const keyFactsRef = useRef<HTMLTextAreaElement>(null);
    const quoteBlockRef = useRef<HTMLTextAreaElement>(null);
    const ctaRef = useRef<HTMLInputElement>(null);

    // Attach the click-outside handler for each editable field
    //@ts-ignore
    useClickOutside(titleRef, () => setIsEditingTitle(false));
    //@ts-ignore
    useClickOutside(bylineRef, () => setIsEditingByline(false));
    //@ts-ignore
    useClickOutside(leadParagraphRef, () => setIsEditingLeadParagraph(false));
    //@ts-ignore
    useClickOutside(contentRef, () => setIsEditingContent(false));
    //@ts-ignore
    //@ts-ignore
    useClickOutside(keyFactsRef, () => setIsEditingKeyFacts(false));
    //@ts-ignore
    useClickOutside(quoteBlockRef, () => setIsEditingQuoteBlock(false));
    //@ts-ignore
    useClickOutside(ctaRef, () => setIsEditingCta(false));


    const [newsletterLoader, setnewsLetterLoader] = useState(true)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);



    const [articleData, setArticleData] = useState<{ [key: string]: Article[] }>({
        A: [], B: [], C: [], D: [],
    });
    const [articleLoading, setArticleLoading] = useState<{ [key: string]: boolean }>({
        A: false, B: false, C: false, D: false,
    });
    const [articleError, setArticleError] = useState<{ [key: string]: string | null }>({
        A: null, B: null, C: null, D: null,
    });
    const [articleDetailLoading, setArticleDetailLoading] = useState(false);
    const [articleDetailError, setArticleDetailError] = useState<string | null>(null);

    const router = useRouter();

    const calculateTotalWordCount = useMemo(() => {
        const allContent = [
            editedTitle, editedByline, editedLeadParagraph, editedContent,
            editedKeyFacts, editedQuoteBlock, editedCta,
        ].join(" ").trim();
        if (!allContent) return 0;
        return allContent.split(/\s+/).filter((word) => word.length > 0).length;
    }, [editedTitle, editedByline, editedLeadParagraph, editedContent, editedKeyFacts, editedQuoteBlock, editedCta]);

    const formatKeyFacts = useCallback((keyFacts: string | string[] | undefined): string[] => {
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
    }, []);

    const clearError = useCallback(() => setTimeout(() => setError(null), 5000), []);


    const fetchArticleDetails = useCallback(async (articleId: string) => {
        if (!token) return null;
        setArticleDetailLoading(true);
        setArticleDetailError(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${articleId}/`, {
                method: "GET",
                headers: { Authorization: `Token ${token}` },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    setError("Authentication failed. Please log in again.");
                    clearError();
                    localStorage.removeItem("token");
                    setToken(null);
                    router.push("/");
                    return null;
                }
                if (response.status === 404) {
                    setArticleDetailError("Article not found");
                    return null;
                }
                throw new Error("Failed to fetch article details");
            }
            return await response.json();
        } catch (err) {
            setArticleDetailError("Error loading article details");
            console.error("Error fetching article details:", err);
            return null;
        } finally {
            setArticleDetailLoading(false);
        }
    }, [token, router, clearError]);


    const handleDrop = async (dropIndex: number) => {
        if (draggedIndex === null) return;

        // 1. Update the local state
        const updatedList = [...newsletters];
        const [draggedItem] = updatedList.splice(draggedIndex, 1);
        updatedList.splice(dropIndex, 0, draggedItem);

        setNewsLetters(updatedList);
        setDraggedIndex(null);

        // 2. Prepare payload for API
        const payload = {
            articles: updatedList.map((item, index) => ({
                id: item.id,
                sequence: index + 1, // Assuming sequence starts from 1
            })),
        };

        try {
            // 3. Call the API
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/articles/reorder/`,
                payload,
                {
                    headers: { Authorization: `Token ${token}` },
                }
            );
            console.log("Reorder successful!");
        } catch (error) {
            console.error("Failed to reorder articles:", error);
        }
    };


    const handleImageUpload = async (file: File) => {
        if (!currentArticle || !token) {
            setError("No article selected or authentication required");
            clearError();
            return;
        }
        if (!file.type.startsWith("image/")) {
            setError("Please upload a valid image file");
            clearError();
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB");
            clearError();
            return;
        }
        setArticleSaving(true);
        setSaveSuccess(null);
        try {
            // Delete the old image from Cloudinary if it exists
            if (currentArticle.image_url) {
                const publicId = `article_${currentArticle.id}`; // Adjust based on your public_id format
                const cloudName = "dlimmmixo";
                const apiKey = '696744466887184';
                const apiSecret = '5_s0xrwgyBcnT1FROOvGH5CasmU';
                const timestamp = Math.round(new Date().getTime() / 1000);
                // const signature = await generateCloudinarySignature(publicId, timestamp, apiSecret);

                const destroyResponse = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            public_id: publicId,
                            api_key: apiKey,
                            // signature: signature,
                            timestamp: timestamp,
                        }),
                    }
                );
                if (!destroyResponse.ok) {
                    console.warn("Failed to delete old image from Cloudinary, proceeding with upload");
                }
            }

            // Upload the new image with a unique public_id
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "tpi-overwatch-v2");
            const uniqueId = Date.now();
            formData.append("public_id", `article_${currentArticle.id}_${uniqueId}`);
            formData.append("folder", "tpi");

            const cloudinaryResponse = await fetch(
                "https://api.cloudinary.com/v1_1/dlimmmixo/image/upload",
                { method: "POST", body: formData }
            );
            if (!cloudinaryResponse.ok) {
                const errorData = await cloudinaryResponse.json();
                throw new Error(`Cloudinary upload failed: ${errorData.error?.message || "Unknown error"}`);
            }
            const cloudinaryData = await cloudinaryResponse.json();

            const imageUrl = `${cloudinaryData.secure_url}?v=${uniqueId}`;
            const articleData = { ...currentArticle, image_url: imageUrl };
            const updateResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/articles/${currentArticle.id}/`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
                    body: JSON.stringify(articleData),
                }
            );
            if (!updateResponse.ok) throw new Error("Failed to update article with image URL");
            const updatedArticle = await updateResponse.json();
            setCurrentArticle(updatedArticle);
            setSaveSuccess("Image uploaded successfully!");
            setTimeout(() => setSaveSuccess(null), 3000);
        } catch (err) {
            setError(`Failed to upload image: ${err instanceof Error ? err.message : "Unknown error"}`);
            clearError();
            console.error("Error uploading image:", err);
        } finally {
            setArticleSaving(false);
        }
    };

    const handleImageDelete = async () => {
        if (!currentArticle || !token) {
            setError("No article selected or authentication required");
            clearError();
            return;
        }
        if (!currentArticle.image_url) {
            setError("No image to delete");
            clearError();
            return;
        }
        setArticleSaving(true);
        setSaveSuccess(null);
        try {
            const articleData = { ...currentArticle, image_url: "" };
            const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${currentArticle.id}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
                body: JSON.stringify(articleData),
            });
            if (!updateResponse.ok) {
                if (updateResponse.status === 401) {
                    setError("Authentication failed. Please log in again.");
                    clearError();
                    localStorage.removeItem("token");
                    setToken(null);
                    router.push("/");
                    return;
                }
                if (updateResponse.status === 404) {
                    setError("Article not found");
                    clearError();
                    return;
                }
                throw new Error("Failed to update article");
            }
            const updatedArticle = await updateResponse.json();
            setCurrentArticle(updatedArticle);
            setSaveSuccess("Image deleted successfully!");
            setTimeout(() => setSaveSuccess(null), 3000);
        } catch (err) {
            setError(`Failed to delete image: ${err instanceof Error ? err.message : "Unknown error"}`);
            clearError();
            console.error("Error deleting image:", err);
        } finally {
            setArticleSaving(false);
        }
    };

    const handleDeleteArticle = async () => {
        if (!currentArticle || !token) {
            setError("No article selected or authentication required");
            clearError();
            return;
        }
        if (!confirm(`Are you sure you want to delete the article "${currentArticle.title}"? This action cannot be undone.`)) return;
        setIsDeleting(true);
        setSaveSuccess(null);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${currentArticle.id}/`, {
                method: "DELETE",
                headers: { Authorization: `Token ${token}` },
            });
            if (!response.ok) {
                if (response.status === 401) {
                    setError("Authentication failed. Please log in again.");
                    clearError();
                    localStorage.removeItem("token");
                    setToken(null);
                    router.push("/");
                    return;
                }
                if (response.status === 404) {
                    setError("Article not found");
                    clearError();
                    return;
                }
                throw new Error("Failed to delete article");
            }
            const category = currentArticle.category || selectedCategory;
            setArticleData((prev) => ({ ...prev, [category]: prev[category].filter((article) => article.id !== currentArticle.id) }));
            setCurrentArticle(null);
            setPublishedArticleIds((prev) => {
                const newIds = prev.filter((id) => id !== currentArticle.id);
                localStorage.setItem("publishedArticleIds", JSON.stringify(newIds));
                console.log("Updated publishedArticleIds after delete:", newIds);
                return newIds;
            });
            setSaveSuccess("Article deleted successfully!");
            setTimeout(() => setSaveSuccess(null), 3000);
        } catch (err) {
            setError(`Failed to delete article: ${err instanceof Error ? err.message : "Unknown error"}`);
            clearError();
            console.error("Error deleting article:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleArticleClick = useCallback(async (article: Article) => {
        setCurrentArticle(article);
        setSelectedCategory(article.category || "A");
        setIsEditingTitle(false);
        setIsEditingByline(false);
        setIsEditingLeadParagraph(false);
        setIsEditingContent(false);
        setIsEditingKeyFacts(false);
        setIsEditingQuoteBlock(false);
        setIsEditingCta(false);
        const fullArticle = await fetchArticleDetails(article.id);
        if (fullArticle) setCurrentArticle(fullArticle.article);
    }, [fetchArticleDetails]);

    const normalizeArticle = (article: Article) => {
        let keyFacts: string[] = [];

        if (Array.isArray(article.key_facts)) {
            keyFacts = article.key_facts;
        } else if (typeof article.key_facts === "string") {
            try {
                // Try parsing if it's a JSON-like string
                const parsed = JSON.parse(article.key_facts.replace(/'/g, '"'));
                if (Array.isArray(parsed)) {
                    keyFacts = parsed;
                } else {
                    // fallback split by line breaks or commas
                    keyFacts = article.key_facts
                        .split(/\r?\n|,/)
                        .map((f) => f.trim())
                        .filter(Boolean);
                }
            } catch {
                keyFacts = article.key_facts
                    .split(/\r?\n|,/)
                    .map((f) => f.trim())
                    .filter(Boolean);
            }
        }

        return {
            ...article,
            key_facts: keyFacts,
        };
    };

    const downloadPdf = async (article: Article) => {
        const normalizedArticle = normalizeArticle(article);
        const pdfProps: ArticlePDFProps = {
            currentArticle: {
                image_url: normalizedArticle.image_url ?? "",
                created_at: normalizedArticle.created_at ?? "",
            },
            editedTitle: normalizedArticle.title ?? "",
            editedByline: normalizedArticle.byline ?? "",
            editedLeadParagraph: normalizedArticle.lead_paragraph ?? "",
            editedContent: normalizedArticle.content ?? "",
            editedKeyFacts: normalizedArticle.key_facts as string[],
            editedQuoteBlock: normalizedArticle.quote_block ?? "",
            editedTags: normalizedArticle.tags ?? "",
            editedCta: normalizedArticle.cta ?? "",
        };

        const blob = await pdf(<ArticlePDF {...pdfProps} />).toBlob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${normalizedArticle.title?.replace(/\s+/g, "_") || "article"}.pdf`;
        link.click();

        URL.revokeObjectURL(url);
        handleExportPDF();
    };

    const handleCategoryClick = useCallback((category: string) => {
        setSelectedCategory(category);
        setCurrentArticle(null);
        setIsEditingTitle(false);
        setIsEditingByline(false);
        setIsEditingLeadParagraph(false);
        setIsEditingContent(false);
        setIsEditingKeyFacts(false);
        setIsEditingQuoteBlock(false);
        setIsEditingCta(false);
    }, []);

    const handleSaveArticle = async () => {
        if (!token) {
            setError("Authentication required");
            clearError();
            return;
        }
        setArticleSaving(true);
        setSaveSuccess(null);
        try {
            let response;
            const articleData = {
                title: editedTitle,
                content: editedContent,
                byline: editedByline,
                lead_paragraph: editedLeadParagraph,
                key_facts: editedKeyFacts,
                quote_block: editedQuoteBlock,
                cta: editedCta,
                tags: editedTags,
                category: currentArticle?.category || selectedCategory,
                is_newsletter: currentArticle?.is_newsletter ? 1 : 0,
                image_url: currentArticle?.image_url || "",
            };
            if (currentArticle) {
                response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${currentArticle.id}/`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
                    body: JSON.stringify(articleData),
                });
            } else {
                response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
                    body: JSON.stringify(articleData),
                });
            }
            if (!response.ok) {
                if (response.status === 401) {
                    setError("Authentication failed. Please log in again.");
                    clearError();
                    localStorage.removeItem("token");
                    setToken(null);
                    router.push("/");
                    return;
                }
                if (response.status === 404 && currentArticle) {
                    setError("Article not found or you do not have permission");
                    clearError();
                    return;
                }
                throw new Error("Failed to save article");
            }
            const updatedArticle = await response.json();
            setCurrentArticle(updatedArticle);
            setSaveSuccess("Article saved successfully!");
            setIsEditingTitle(false);
            setIsEditingByline(false);
            setIsEditingLeadParagraph(false);
            setIsEditingContent(false);
            setIsEditingKeyFacts(false);
            setIsEditingQuoteBlock(false);
            setIsEditingCta(false);
            setTimeout(() => setSaveSuccess(null), 3000);
            fetchArticles();
        } catch (err) {
            setError("An error occurred while saving the article");
            clearError();
            console.error("Error saving article:", err);
        } finally {
            setArticleSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!token) {
            setError("Authentication required");
            clearError();
            return;
        }
        if (!currentArticle) {
            setError("No article selected to publish");
            clearError();
            return;
        }

        setArticleSaving(true);
        setSaveSuccess(null);
        try {
            // Save the current article if it’s being edited
            if (currentArticle) {
                await handleSaveArticle();
            }
            // Fetch full article details
            const fullArticle = await fetchArticleDetails(currentArticle.id);
            if (!fullArticle) {
                throw new Error(`Failed to fetch details for article ${currentArticle.id}`);
            }
            // Update newsletter status
            const updatedArticle = {
                ...fullArticle, is_newsletter: 1,
            };
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${currentArticle.id}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
                body: JSON.stringify(updatedArticle),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    setError("Authentication failed. Please log in again.");
                    clearError();
                    localStorage.removeItem("token");
                    setToken(null);
                    router.push("/");
                    return;
                }
                throw new Error(`Failed to update article ${currentArticle.id} newsletter status`);
            }
            const savedArticle = await response.json();
            // Update publishedArticleIds and save to localStorage
            setPublishedArticleIds((prev) => {
                if (prev.includes(savedArticle.id)) {
                    return prev; // Avoid duplicates
                }
                const newIds = [...prev, savedArticle.id];
                localStorage.setItem("publishedArticleIds", JSON.stringify(newIds));
                console.log("Updated publishedArticleIds:", newIds);
                return newIds;
            });
            setCurrentArticle(savedArticle);
            setSaveSuccess("Article published successfully!");
            window.location.reload();
        } catch (err) {
            setError(`Failed to publish article: ${err instanceof Error ? err.message : "Unknown error"}`);
            clearError();
            console.error("Error publishing article:", err);
        } finally {
            setArticleSaving(false);
        }
    };

    const handleUnpublish = async () => {
        if (!currentArticle || !token) {
            setError("No article selected or authentication required");
            clearError();
            return;
        }

        setArticleSaving(true);
        setSaveSuccess(null);
        try {
            const updatedArticle = { ...currentArticle, is_newsletter: 0 };
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${currentArticle.id}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
                body: JSON.stringify(updatedArticle),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    setError("Authentication failed. Please log in again.");
                    clearError();
                    localStorage.removeItem("token");
                    setToken(null);
                    router.push("/");
                    return;
                }
                throw new Error("Failed to update article newsletter status");
            }
            const savedArticle = await response.json();
            setPublishedArticleIds((prev) => {
                const newIds = prev.filter((id) => id !== currentArticle.id);
                localStorage.setItem("publishedArticleIds", JSON.stringify(newIds));
                console.log("Updated publishedArticleIds after unpublish:", newIds);
                return newIds;
            });
            setCurrentArticle(savedArticle);
            setSaveSuccess("Article unpublished successfully!");
            setTimeout(() => setSaveSuccess(null), 2000);
        } catch (err) {
            setError(`Failed to unpublish article: ${err instanceof Error ? err.message : "Unknown error"}`);
            clearError();
            console.error("Error unpublishing article:", err);
        } finally {
            setArticleSaving(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        if (!token) {
            setError("Please log in to search");
            clearError();
            return;
        }
        setIsLoading(true);
        setError(null);
        const MAX_CHAT_HISTORY = 50;
        const newUserMessage: ChatMessage = { role: "user", content: searchQuery };
        setChatHistory((prev) => [...prev.slice(-MAX_CHAT_HISTORY + 1), newUserMessage]);
        let requestBody: { query: string; session_id?: string; article_id?: string } = { query: searchQuery };
        if (sessionId) requestBody.session_id = sessionId;
        if (currentArticle?.id) requestBody.article_id = currentArticle.id;
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ask-agent/`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    setError("Authentication failed. Please log in again.");
                    clearError();
                    localStorage.removeItem("token");
                    setToken(null);
                    router.push("/");
                    return;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const data = await response.json();
            const assistantMessage: ChatMessage = { role: "assistant", content: data.option1.response };
            setChatHistory((prev) => [...prev.slice(-MAX_CHAT_HISTORY + 1), assistantMessage]);
            setSearchQuery("");
            if (!sessionId && data.session_id) setSessionId(data.session_id);
            if (data.option2 && data.option2.response && typeof data.option2.response === "object" && "id" in data.option2.response) {
                const articleData = data.option2.response;
                const newArticle: FullArticle = {
                    id: articleData.id,
                    title: articleData.title || "Generated Article",
                    content: articleData.content || "Generated content from search.",
                    category: articleData.category || "A",
                    is_newsletter: articleData.is_newsletter || false,
                    created_at: articleData.created_at || new Date().toISOString(),
                    byline: articleData.byline || "AI Generated",
                    lead_paragraph: articleData.lead_paragraph || "AI-generated lead paragraph.",
                    key_facts: typeof articleData.key_facts === "string"
                        ? (() => {
                            try {
                                const parsed = JSON.parse(articleData.key_facts);
                                return Array.isArray(parsed) ? parsed.join("\n") : articleData.key_facts;
                            } catch {
                                return articleData.key_facts;
                            }
                        })()
                        : Array.isArray(articleData.key_facts)
                            ? articleData.key_facts.join("\n")
                            : "",
                    quote_block: articleData.quote_block || "AI-generated quote.",
                    cta: articleData.cta || "Learn more",
                    tags: Array.isArray(articleData.tags) ? articleData.tags.join(", ") : articleData.tags || "",
                    image_url: articleData.image_url || "",
                    is_auto_generated: true,
                    conversation_session: articleData.conversation_session || sessionId,
                };
                setCurrentArticle(newArticle);
                setSelectedCategory(newArticle.category || "A");
                fetchArticles();
            }
        } catch (err) {
            console.error("Search error:", err);
            setError(`Search failed: ${err instanceof Error ? err.message : "Unknown error"}`);
            clearError();
            setChatHistory((prev) => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    };

    const handleExportPDF = async () => {
        const editedKeyFactsArray = editedKeyFacts
            .split(/\r?\n/)        // Split by line breaks
            .map(fact => fact.trim()) // Remove extra spaces
            .filter(fact => fact);    // Remove empty strings
        const pdfProps: ArticlePDFProps = {
            currentArticle: currentArticle ?? { image_url: "", created_at: "" },
            editedTitle: editedTitle ?? "",
            editedByline: editedByline ?? "",
            editedLeadParagraph: editedLeadParagraph ?? "",
            editedContent: editedContent ?? "",
            editedKeyFacts: editedKeyFactsArray ?? [],
            editedQuoteBlock: editedQuoteBlock ?? "",
            editedTags: editedTags ?? "",
            editedCta: editedCta ?? "",
        };

        const blob = await pdf(<ArticlePDF {...pdfProps} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "article.pdf";
        link.click();

        URL.revokeObjectURL(url);
    };

    // Fetch articles from API
    const fetchArticles = async () => {
        setLoading(true);

        const token =
            typeof window !== "undefined" ? localStorage.getItem("token") : null;

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
            console.log(response, "response")
            const fetchedArticles = response?.data?.results || [];

            // Group by category
            const grouped = { A: [], B: [], C: [], D: [] };
            fetchedArticles.forEach((article: Article) => {
                //@ts-ignore
                if (grouped[article?.category]) {
                    //@ts-ignore
                    grouped[article?.category].push(article);
                }
            });

            setArticles(fetchedArticles);
            setArticleData(grouped);
        } catch (error) {
            console.error("Error fetching articles:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNewsletters = async () => {
        setnewsLetterLoader(true);

        const token =
            typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (!token) {

            setnewsLetterLoader(false);
            return;
        }

        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/articles/latest/?is_newsletter=1`,
                {
                    headers: { Authorization: `Token ${token}` },
                }
            );
            const fetchedArticles = response?.data?.results || [];

            // Group by category
            const grouped = { A: [], B: [], C: [], D: [] };
            fetchedArticles.forEach((article: Article) => {
                //@ts-ignore
                if (grouped[article?.category]) {
                    //@ts-ignore
                    grouped[article?.category].push(article);
                }
            });

            setNewsLetters(fetchedArticles);
            // setArticleData(grouped);
        } catch (error) {
            console.error("Error fetching articles:", error);
        } finally {
            setnewsLetterLoader(false);
        }
    };
    const remove = async (item: Article) => {
        handleUnpublish()
        try {
            const updatedArticle = { ...currentArticle, is_newsletter: 0 };
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${item.id}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
                body: JSON.stringify(updatedArticle),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    setError("Authentication failed. Please log in again.");
                    clearError();
                    localStorage.removeItem("token");
                    setToken(null);
                    router.push("/");
                    return;
                }
                throw new Error("Failed to update article newsletter status");
            }
            const savedArticle = await response.json();
            setPublishedArticleIds((prev) => {
                const newIds = prev.filter((id) => id !== item.id);
                localStorage.setItem("publishedArticleIds", JSON.stringify(newIds));
                console.log("Updated publishedArticleIds after unpublish:", newIds);
                return newIds;
            });
            setCurrentArticle(savedArticle);
            setSaveSuccess("Article unpublished successfully!");
            setTimeout(() => setSaveSuccess(null), 2000);
            window.location.reload();
        } catch (err) {
            setError(`Failed to unpublish article: ${err instanceof Error ? err.message : "Unknown error"}`);
            clearError();
            console.error("Error unpublishing article:", err);
        } finally {
            setArticleSaving(false);
        }
    }
    useEffect(() => {
        fetchArticles();
        fetchNewsletters()
    }, []);

    useEffect(() => {
        if (currentArticle) {
            setEditedTitle(currentArticle.title || "");
            setEditedByline(currentArticle.byline || "");
            setEditedLeadParagraph(currentArticle.lead_paragraph || "");
            setEditedContent(currentArticle.content || "");
            setEditedKeyFacts(
                Array.isArray(currentArticle.key_facts)
                    ? currentArticle.key_facts.join("\n")
                    : typeof currentArticle.key_facts === "string"
                        ? (() => {
                            try {
                                const parsed = JSON.parse(currentArticle.key_facts);
                                return Array.isArray(parsed) ? parsed.join("\n") : currentArticle.key_facts;
                            } catch {
                                return currentArticle.key_facts;
                            }
                        })()
                        : ""
            );
            setEditedQuoteBlock(currentArticle.quote_block || '');
            setEditedCta(currentArticle.cta || "");
            setEditedTags(currentArticle.tags || "");
        } else {
            setEditedTitle("");
            setEditedByline("");
            setEditedLeadParagraph("");
            setEditedContent("");
            setEditedKeyFacts("");
            setEditedQuoteBlock('');
            setEditedCta("");
            setEditedTags("");
        }
    }, [currentArticle]);

    useEffect(() => {
        if (isEditingTitle && titleRef.current) titleRef.current.focus();
        if (isEditingByline && bylineRef.current) bylineRef.current.focus();
        if (isEditingLeadParagraph && leadParagraphRef.current) leadParagraphRef.current.focus();
        if (isEditingContent && contentRef.current) contentRef.current.focus();
        if (isEditingKeyFacts && keyFactsRef.current) keyFactsRef.current.focus();
        if (isEditingQuoteBlock && quoteBlockRef.current) quoteBlockRef.current.focus();
        if (isEditingCta && ctaRef.current) ctaRef.current.focus();
    }, [isEditingTitle, isEditingByline, isEditingLeadParagraph, isEditingContent, isEditingKeyFacts, isEditingQuoteBlock, isEditingCta]);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                const userData = JSON.parse(storedUser);
                console.log("Logged in user:", userData);
            } catch (err) {
                console.error("Error parsing user data:", err);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/");
            }
        } else {
            router.push("/");
        }
        // Load publishedArticleIds from localStorage
        const savedPublishedIds = localStorage.getItem("publishedArticleIds");
        if (savedPublishedIds) {
            try {
                const parsedIds = JSON.parse(savedPublishedIds);
                if (Array.isArray(parsedIds)) {
                    setPublishedArticleIds(parsedIds);
                    console.log("Loaded publishedArticleIds from localStorage:", parsedIds);
                }
            } catch (err) {
                console.error("Error parsing publishedArticleIds from localStorage:", err);
                localStorage.setItem("publishedArticleIds", JSON.stringify([]));
            }
        } else {
            localStorage.setItem("publishedArticleIds", JSON.stringify([]));
        }
    }, [router]);

    return (
        <DashboardLayout getPrompts={setSearchQuery}>
            <div className="flex-1 flex flex-col">
                <main className="flex-1 p-3 lg:p-5 space-y-4 lg:space-y-6">
                    <div className="bg-white shadow-lg border border-gray-100 rounded-lg transform hover:shadow-xl transition-all duration-300">
                        <div className="bg-[#171a39] text-white text-center py-4 rounded-t-lg">
                            <h2 className="text-lg lg:text-xl font-semibold">NEWSLETTER SHELF</h2>
                            {/* <p className="text-xs lg:text-sm text-gray-300 mt-1">Click an article to see it in the Article Frame</p> */}
                        </div>
                        <div className="p-4 lg:p-6">
                            <div className="mb-4">
                                {newsletterLoader ? (
                                    <div className="flex items-center justify-center">
                                        <CgSpinner className="animate-spin w-10 h-10" />
                                    </div>
                                ) : (
                                    <>
                                        {newsletters.length > 0 ? (
                                            <ul className="space-y-2">
                                                {newsletters.map((item, index) => (
                                                    <li
                                                        key={item.id}
                                                        draggable
                                                        onDragStart={() => setDraggedIndex(index)}
                                                        onDragOver={(e) => e.preventDefault()} // allow drop
                                                        onDrop={() => handleDrop(index)}
                                                        className="bg-gray-100 p-3 rounded-lg text-xs text-gray-700 hover:bg-blue-50 transition-colors duration-300 shadow-sm flex items-center gap-2"
                                                    >
                                                        {/* Drag Handle */}
                                                        <span className="cursor-grab text-gray-400">
                                                            <FaGripVertical size={16} />
                                                        </span>

                                                        {/* Article Title */}
                                                        <span
                                                            className="cursor-pointer font-medium flex-1"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleArticleClick(item);
                                                            }}
                                                        >
                                                            Slot {index + 1}: {item.title}
                                                        </span>

                                                        {/* Action Buttons */}
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleArticleClick(item);
                                                                    document.getElementById("article")?.scrollIntoView({ behavior: "smooth" });
                                                                }}
                                                                className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition duration-300"
                                                                title="View"
                                                            >
                                                                <FaEye size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => downloadPdf(item)}
                                                                className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition duration-300"
                                                                title="Export PDF"
                                                            >
                                                                <FaFilePdf size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => remove(item)}
                                                                className="p-2 rounded-full bg-gray-400 text-white hover:bg-gray-500 transition duration-300"
                                                                title="Remove"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-gray-500">No Article Added To Newsletter</p>
                                        )}
                                    </>
                                )}
                            </div>

                        </div>
                    </div>

                    <div className="bg-white shadow-lg border border-gray-100 rounded-lg transform hover:shadow-xl transition-all duration-300">
                        <div className="bg-[#171a39] text-white text-center py-4 rounded-t-lg">
                            <h2 className="text-lg lg:text-xl font-semibold">ARTICLE SHELF</h2>
                            <p className="text-xs lg:text-sm text-gray-300 mt-1">Click an article to see it in the Article Frame</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
                            {Object.entries(articleCategories).map(([category, categoryName]) => (
                                <div
                                    key={category}
                                    className="bg-white shadow-md rounded-lg  overflow-hidden transform hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    onClick={() => handleCategoryClick(category)}
                                >
                                    <div className="bg-[#D5ECFF] px-3 py-3 text-center">
                                        <h3 className="text-sm font-medium text-gray-800">{categoryName} ({articleData[category]?.length || 0})</h3>
                                    </div>
                                    <div className="relative">
                                        <div className="h-40 overflow-y-auto article-shelf-scroll">
                                            <div className="p-2 space-y-1">
                                                {articleLoading[category] ? (
                                                    <div className="bg-gray-100 p-3 rounded text-xs text-gray-500 text-center animate-pulse">Loading articles...</div>
                                                ) : articleError[category] ? (
                                                    <div className="bg-red-50 p-3 rounded text-xs text-red-600 text-center">{articleError[category]}</div>
                                                ) : (
                                                    articleData[category].map((article) => (
                                                        <div
                                                            key={article.id}
                                                            className={`shadow-md p-3 rounded text-xs cursor-pointer hover:scale-105 transition-all duration-200 ${currentArticle?.id === article.id ? "bg-[#132A36] text-white" : "bg-gray-100 text-gray-700 hover:bg-blue-50"}`}
                                                            title={article.title}
                                                            draggable={true}
                                                            onDragStart={(e) => {
                                                                e.dataTransfer.setData("application/json", JSON.stringify(article));
                                                                e.dataTransfer.effectAllowed = "copy";
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleArticleClick(article);
                                                            }}
                                                        >
                                                            {article.title.length > 50 ? `${article.title.substring(0, 50)}...` : article.title}

                                                            {article.is_newsletter && (
                                                                <span className="ml-2 text-green-500">
                                                                    (Slot {articleData[category].filter(a => a.is_newsletter).indexOf(article) + 1})
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

                        <div className="bg-white rounded-lg shadow-md border border-gray-200 h-[800px] flex flex-col transform hover:shadow-lg transition-all duration-300">
                            <div className="bg-[#171a39] text-white text-center py-3 rounded-t-lg">
                                <h2 className="text-base lg:text-lg font-semibold">AI CHAT</h2>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto">
                                {error && <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded animate-slideInDown">{error}</div>}
                                {chatHistory.length === 0 && !isLoading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center lg:text-base">
                                        <p className="text-2xl text-gray-800 font-bold">I am bot</p>
                                        <p className="text-lg">How can I help you?</p>
                                    </div>
                                )}
                                <div className="space-y-4 lg:space-y-6">
                                    {chatHistory.map((message, index) => (
                                        <div key={index} className="flex items-start space-x-3 animate-slideInUp">
                                            <div className="w-8 lg:w-10 h-8 lg:h-10 bg-black rounded flex items-center justify-center text-white font-bold text-xs lg:text-sm flex-shrink-0">{message.role === "user" ? "U" : "AI"}</div>
                                            <div className="flex-1 bg-gray-50 shadow-md rounded-lg p-3 lg:p-4 transform hover:scale-105 transition-all duration-200">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="font-medium text-gray-900 text-sm">{message.role === "user" ? "You" : "AI Bot"}</span>
                                                    <span className="text-xs text-gray-500">{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                </div>
                                                <p className="text-xs lg:text-sm text-gray-700 whitespace-pre-wrap">{message.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex items-start space-x-3 animate-slideInUp">
                                            <div className="w-8 lg:w-10 h-8 lg:h-10 bg-black rounded flex items-center justify-center text-white font-bold text-xs lg:text-sm flex-shrink-0">AI</div>
                                            <div className="flex-1 bg-gray-50 shadow-md rounded-lg p-3 lg:p-4">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="font-medium text-gray-900 text-sm">AI Bot</span>
                                                    <span className="text-xs text-gray-500">thinking...</span>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        <div
                            className="bg-white rounded-lg border border-gray-200 shadow-md h-[800px] flex flex-col transform hover:shadow-lg transition-all duration-300"
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = "copy";
                            }}
                            onDrop={async (e) => {
                                e.preventDefault();
                                try {
                                    const articleData = JSON.parse(e.dataTransfer.getData("application/json"));
                                    if (!articleData.id || !articleData.title) throw new Error("Invalid article data");
                                    await handleArticleClick(articleData);
                                } catch (err) {
                                    setError("Failed to load dropped article");
                                    clearError();
                                    console.error("Error handling dropped article:", err);
                                }
                            }}
                        >
                            <div className="bg-[#171a39] text-white text-center py-3 rounded-t-lg">
                                <h2 className="text-base lg:text-lg font-semibold" id="article">ARTICLE FRAME</h2>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto">
                                {saveSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm animate-slideInDown">{saveSuccess}</div>}
                                {articleDetailLoading && <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm animate-slideInDown">Loading article details...</div>}
                                {articleDetailError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm animate-slideInDown">{articleDetailError}</div>}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm">Article Type:</span>
                                        <Badge className="bg-gray-800 text-white hover:bg-gray-800 rounded-lg transition-colors duration-200">{currentArticle ? articleCategories[currentArticle.category as keyof typeof articleCategories] : articleCategories[selectedCategory as keyof typeof articleCategories] || "Feature Story"}</Badge>
                                    </div>
                                    <div className="text-sm"><span>Word Count: {calculateTotalWordCount}</span></div>
                                </div>
                                <div className="mb-6 relative">
                                    <div className="relative group">
                                        <img src={currentArticle?.image_url || "/placeholder.svg?height=300&width=800&text=Army+Veterans+in+Service"} alt="Article Hero" className="w-full h-48 object-cover rounded-lg shadow-md" />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-3">
                                                <button onClick={() => document.getElementById("imageUpload")?.click()} className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2 shadow-lg">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    <span>Upload Image</span>
                                                </button>
                                                <button onClick={handleImageDelete} className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2 shadow-lg" disabled={isDeleting || articleSaving}>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <input title='das' id="imageUpload" type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} className="hidden" />
                                </div>
                                <div className="mb-4">
                                    {isEditingTitle ? (
                                        <div className="space-y-2">
                                            <Textarea ref={titleRef} value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className="text-2xl font-bold resize-none border-2 border-blue-300 focus:border-blue-500" rows={2} placeholder="Enter article title..." disabled={isDeleting || articleSaving} />
                                        </div>
                                    ) : (
                                        <div className="group relative cursor-text hover:bg-gray-50 p-2 rounded-md transition-colors flex items-center justify-between" onClick={() => setIsEditingTitle(true)}>
                                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{editedTitle || "Click to add title..."}</h1>
                                            <div className="flex items-center space-x-2">
                                                {currentArticle && (
                                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteArticle(); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700" title="Delete Article" disabled={isDeleting || articleSaving}>
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <Edit3 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="mb-6">
                                    {isEditingByline ? (
                                        <div className="space-y-2">
                                            <Input ref={bylineRef} value={editedByline} onChange={(e) => setEditedByline(e.target.value)} className="border-2 border-blue-300 focus:border-blue-500" placeholder="Enter byline..." disabled={isDeleting || articleSaving} />
                                        </div>
                                    ) : (
                                        <div className="group relative cursor-text hover:bg-gray-50 p-2 rounded-md transition-colors" onClick={() => setIsEditingByline(true)}>
                                            <p className="text-gray-600 italic">{editedByline || "Click to add byline..."}</p>
                                            <Edit3 className="w-4 h-4 absolute top-2 right-2 opacity-0 group-hover:opacity-50 transition-opacity text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="mb-6">
                                    {isEditingLeadParagraph ? (
                                        <div className="space-y-2">
                                            <Textarea ref={leadParagraphRef} value={editedLeadParagraph} onChange={(e) => setEditedLeadParagraph(e.target.value)} className="text-lg font-medium resize-none border-2 border-blue-300 focus:border-blue-500" rows={3} placeholder="Enter lead paragraph..." disabled={isDeleting || articleSaving} />
                                        </div>
                                    ) : (
                                        <div className="group relative cursor-text hover:bg-gray-50 p-2 rounded-md transition-colors" onClick={() => setIsEditingLeadParagraph(true)}>
                                            <p className="text-lg font-medium text-gray-800 leading-relaxed">{editedLeadParagraph || "Click to add lead paragraph..."}</p>
                                            <Edit3 className="w-4 h-4 absolute top-2 right-2 opacity-0 group-hover:opacity-50 transition-opacity text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-6 text-justify">
                                        <div>
                                            {isEditingContent ? (
                                                <div className="space-y-2">
                                                    <Textarea ref={contentRef} value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="resize-none border-2 border-blue-300 focus:border-blue-500 min-h-[200px]" rows={8} placeholder="Enter main article content..." disabled={isDeleting || articleSaving} />
                                                </div>
                                            ) : (
                                                <div className="group relative cursor-text hover:bg-gray-50 p-3 rounded-md transition-colors min-h-[200px]" onClick={() => setIsEditingContent(true)}>
                                                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{editedContent || "Click to add main content..."}</div>
                                                    <Edit3 className="w-4 h-4 absolute top-3 right-3 opacity-0 group-hover:opacity-50 transition-opacity text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="lg:col-span-1 space-y-6">
                                        <div className="bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                                            <div className="bg-gray-200 px-4 py-3 border-b border-gray-200">
                                                <h3 className="font-bold text-gray-800">Key Facts</h3>
                                            </div>
                                            {isEditingKeyFacts ? (
                                                <div className="p-4 space-y-2">
                                                    <Textarea ref={keyFactsRef} value={editedKeyFacts} onChange={(e) => setEditedKeyFacts(e.target.value)} className="text-sm resize-none border-2 border-blue-300 focus:border-blue-500 bg-white" rows={6} placeholder="Enter key facts (one per line)..." disabled={isDeleting || articleSaving} />
                                                </div>
                                            ) : (
                                                <div className="group relative cursor-text hover:bg-gray-100 p-4 transition-colors" onClick={() => setIsEditingKeyFacts(true)}>
                                                    {formatKeyFacts(editedKeyFacts).length > 0 ? (
                                                        <ul className="space-y-2 list-disc pl-5">
                                                            {formatKeyFacts(editedKeyFacts).map((fact, index) => (
                                                                <li key={index} className="text-sm text-gray-700 leading-relaxed">{fact}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-sm text-gray-500 italic">Click to add key facts...</p>
                                                    )}
                                                    <Edit3 className="w-4 h-4 absolute top-4 right-4 opacity-0 group-hover:opacity-50 transition-opacity text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg overflow-hidden">
                                            {isEditingQuoteBlock ? (
                                                <div className="p-4 space-y-2">
                                                    <Textarea ref={quoteBlockRef} value={editedQuoteBlock} onChange={(e) => setEditedQuoteBlock(e.target.value)} className="text-lg italic resize-none border-2 border-blue-300 focus:border-blue-500 bg-white" rows={3} placeholder="Enter quote..." disabled={isDeleting || articleSaving} />
                                                </div>
                                            ) : (
                                                <div className="group relative cursor-text hover:bg-blue-100 p-4 transition-colors" onClick={() => setIsEditingQuoteBlock(true)}>
                                                    <blockquote className="text-lg italic text-gray-700 relative">
                                                        <span className="text-4xl text-blue-400 absolute -top-2 -left-1">"</span>
                                                        <span className="pl-6 block">{editedQuoteBlock || "Click to add quote..."}</span>
                                                        <span className="text-4xl text-blue-400 absolute -bottom-2 -right-1">"</span>
                                                    </blockquote>
                                                    <Edit3 className="w-4 h-4 absolute top-4 right-4 opacity-0 group-hover:opacity-50 transition-opacity text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-600 pt-6 border-t border-gray-200 mt-6 overflow-hidden">
                                    <div className="flex items-center space-x-4 min-w-0">
                                        <span className="truncate">Topic: {editedTags}</span>
                                        <span className="whitespace-nowrap">{currentArticle?.created_at ? new Date(currentArticle.created_at).toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }) : new Date().toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })}</span>
                                        <span className="truncate">Source: TPI News</span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    {isEditingCta ? (
                                        <div className="space-y-2">
                                            <Input ref={ctaRef} value={editedCta} onChange={(e) => setEditedCta(e.target.value)} className="border-2 border-blue-300 focus:border-blue-500" placeholder="Enter CTA link..." disabled={isDeleting || articleSaving} />
                                        </div>
                                    ) : (
                                        <div className="group relative cursor-text hover:bg-gray-50 p-2 rounded-md transition-colors" onClick={() => setIsEditingCta(true)}>
                                            <a href={editedCta} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm hover:underline block" onClick={(e) => e.preventDefault()}>{editedCta || "Click to add CTA link..."}</a>
                                            <Edit3 className="w-4 h-4 absolute top-2 right-2 opacity-0 group-hover:opacity-50 transition-opacity text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#D5ECFF] rounded-lg px-4 py-3 mt-6 space-y-3 sm:space-y-0 sm:gap-4">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => window.open("/newsletterpublish", "_blank")}
                                            className="flex items-center space-x-1 px-3 py-2 text-white text-xs font-medium rounded transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{ backgroundColor: "#171A39" }}
                                            disabled={isDeleting || articleSaving}
                                        >
                                            <FaEye className="w-4 h-4" />
                                            <span>View Newsletter</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {/* Save Button */}
                                        <Button
                                            onClick={handleSaveArticle}
                                            disabled={articleSaving || isDeleting}
                                            size="sm"
                                            variant="outline"
                                            className="flex items-center space-x-1 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent border-[#171A39] text-[#171A39] hover:bg-[#171A39]/10"
                                        >
                                            <img src="/Save.svg" alt="Save" className="w-4 h-4" />
                                            <span className="text-xs">{articleSaving ? "Saving..." : "Save"}</span>
                                        </Button>

                                        {/* Publish / Unpublish Button */}
                                        {currentArticle?.is_newsletter ? (
                                            <Button
                                                onClick={handleUnpublish}
                                                disabled={articleSaving || isDeleting}
                                                size="sm"
                                                variant="outline"
                                                className="flex items-center space-x-1 transition-all duration-200 transform hover:scale-105 bg-transparent border-[#171A39] text-[#171A39] hover:bg-[#171A39]/10"
                                            >
                                                <img src="/Frame.svg" alt="Unpublish" className="w-4 h-4" />
                                                <span className="text-xs">Remove</span>
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handlePublish}
                                                size="sm"
                                                variant="outline"
                                                className="flex items-center space-x-1 transition-all duration-200 transform hover:scale-105 bg-transparent border-[#171A39] text-[#171A39] hover:bg-[#171A39]/10"
                                            >
                                                <img src="/Frame.svg" alt="Publish" className="w-4 h-4" />
                                                <span className="text-xs">Add</span>
                                            </Button>
                                        )}

                                        {/* Export PDF Button */}
                                        <Button
                                            type="button"
                                            onClick={handleExportPDF}
                                            disabled={articleSaving || isDeleting}
                                            size="sm"
                                            variant="outline"
                                            className="flex items-center space-x-1 transition-all duration-200 transform hover:scale-105 bg-transparent border-[#171A39] text-[#171A39] hover:bg-[#171A39]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <img src="/Export Pdf.svg" alt="Export" className="w-4 h-4" />
                                            <span className="text-xs">Export</span>
                                        </Button>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border p-4 mb-4 transform hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-2">
                            <Input placeholder="Ask anything..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={handleSearchKeyPress} className="flex-1 h-10 lg:h-12 text-sm lg:text-base" disabled={isLoading} />
                            <Button size="lg" onClick={handleSearch} className="bg-[#132A36] hover:bg-[#003366] rounded-full h-10 w-10 lg:h-12 lg:w-12 p-0 transition-all duration-200" disabled={isLoading || !searchQuery.trim()}>
                                <Send className="w-4 lg:w-5 h-4 lg:h-5" />
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </DashboardLayout>
    )
}
export default page