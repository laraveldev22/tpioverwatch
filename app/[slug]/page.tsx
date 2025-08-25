"use client";
import { useState, useEffect, use } from 'react';
import { Mail, Phone, Shield, Globe, Printer } from 'lucide-react';
import axios from 'axios';
import { FaFilePdf } from 'react-icons/fa';
import { MdPublishedWithChanges } from "react-icons/md";
import { ImSpinner2 } from "react-icons/im";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { triggerPageReload } from '@/lib/storageTrigger';

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
  cta_url?: string,
}

// Helper function to format date as DD-month-YYYY
const formatDateForSlug = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-AU', { month: 'long' }).toLowerCase();
  const year = date.getFullYear();
  return `tpi-newsletter-publisheddate-${day}-${month}-${year}`;
};

export default function NewsletterPublish({ params }: { params: Promise<{ slug: string }> }) {
  const [publishedArticles, setPublishedArticles] = useState<FullArticle[]>([]);
  const [publishedArticlesPdf, setPublishedArticlesPdf] = useState<any[]>([]);
  const router = useRouter();
  const [articleIds, setArticleIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdhoc, setIsAdhoc] = useState(false)
  const [dynamicCode, setDynamicCode] = useState("");
  const [showPublishOptions, setShowPublishOptions] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [editableTitle, setEditableTitle] = useState("TPI Newsletter");
  const [editableMessageTitle, setEditableMessageTitle] = useState("Editor's Message");
  const [editableMessage, setEditableMessage] = useState(
    "Welcome to our newsletter — a space dedicated to informing, honouring, and connecting Australia’s totally and permanently incapacitated veterans, along with their families and support networks. Each edition is crafted to share trusted updates, celebrate service, and preserve the stories that define our community. Thank you for allowing us to be part of your journey."
  );

  const [publishing, setPublishing] = useState(false);
  const { slug } = use(params);
  const currentDate = new Date();
  const expectedSlug = formatDateForSlug(currentDate);

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

  const getBase64FromUrl = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Base64 conversion failed:", err);
      return ""; // fallback to empty string if image fails
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform) // remove if already selected
        : [...prev, platform] // add if not selected
    );
  };

  const currentDateFormatted = currentDate.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleExportPDF = async () => {
    if (typeof window === "undefined") return;

    setExporting(true);
    try {
      // Convert logo to Base64
      const logoBase64 = await getBase64FromUrl(`${window.location.origin}/mainLogo.png`);

      // Lazy import PDF renderer and your component
      const { pdf, Document } = await import("@react-pdf/renderer");
      const NewsletterPDF = (await import("./NewsletterPDF")).default;

      // Generate PDF blob
      const blob = await pdf(
        <Document>
          <NewsletterPDF
            Logo={logoBase64 || undefined} // fallback if logo fails
            currentDateFormatted={currentDateFormatted}
            publishedArticles={publishedArticlesPdf}
            editableTitle={editableTitle}
            editableMessage={editableMessage}
          />
        </Document>
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "newsletter.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Export failed:", err);
    } finally {
      setExporting(false);
    }
  };


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
        `${process.env.NEXT_PUBLIC_API_URL}/articles/latest/?is_newsletter=1`,
        { headers: { Authorization: `Token ${token}` } }
      );

      const rawArticles = response?.data?.results || response?.data || [];

      const transformedArticles = rawArticles
        .filter((article: any) => !!article)
        .map((article: any) => ({
          id: article.id,
          title: article.title,
          byline: article.byline,
          lead_paragraph: article.lead_paragraph,
          content: article.content,
          image_url: article.image_url,
          key_facts: formatKeyFacts(article.key_facts),
          quote_block: article.quote_block,
          tags: article.tags,
          created_at: article.updated_at || article.created_at,
          cta: article.cta || "",
          cta_url: article.cta_url || ""
        }));
      const allArticleIds = transformedArticles.map((article: any) => article.id);
      setArticleIds(allArticleIds);
      setPublishedArticlesPdf(transformedArticles);
      setPublishedArticles(transformedArticles);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishNewsletter = async () => {
    if (articleIds.length === 0) return; // nothing to publish
    setPublishing(true);
    const token = localStorage.getItem("token");
    try {
      const payload = {
        title: editableTitle,
        newsletter_url: `${process.env.NEXT_PUBLIC_API_URL}/newsletters/${slug}`,
        ad_hoc: isAdhoc,
        articles: articleIds, // use all stored IDs
        message: editableMessageTitle,
        message_description: editableMessage,
        is_mail_send: selectedPlatforms.includes("mailchimp"),
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/newsletters/publish/`,
        payload,
        { headers: { Authorization: `Token ${token}` } }
      );
      triggerPageReload("dashboard");
      router.push(`/newsletter?slug=${res.data.newsletter.slug}`)

    } catch (error: any) {
      toast.error(error.response.data.error)
    } finally {
      setPublishing(false);
    }
  };

  // If you want it to generate dynamically based on some logic:
  useEffect(() => {
    const getWeekNumber = (date: Date) => {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDays = Math.floor(
        (date.getTime() - firstDayOfYear.getTime()) / 86400000
      );
      return Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
    };

    const now = new Date();
    const weekNumber = getWeekNumber(now);

    const code = `VO${now.getFullYear()}W${weekNumber}`;
    setDynamicCode(code);
  }, []);

  useEffect(() => {
    if (slug !== expectedSlug) {
      router.replace(`/${expectedSlug}`);
      return;
    }
    if (typeof window !== "undefined") {
      try {
        const savedPublishedIds = localStorage.getItem("publishedArticleIds");
        const parsedIds = savedPublishedIds ? JSON.parse(savedPublishedIds) : [];
        if (Array.isArray(parsedIds)) setArticleIds(parsedIds);
      } catch (err) {
        console.error("Error parsing publishedArticleIds:", err);
      }
    }
  }, [slug, router]);

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
    <>
      <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-4">
          {/* Left side: checkbox + label */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAdhoc}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsEditing(checked);

                if (checked) {
                  // ✅ Enable adhoc
                  setIsAdhoc(true);
                } else {

                  setIsAdhoc(false);
                  setEditableTitle("TPI Newsletter")
                  setEditableMessageTitle("Editor's Message")
                  setEditableMessage("Welcome to our newsletter — a space dedicated to informing, honouring, and connecting Australia’s totally and permanently incapacitated veterans, along with their families and support networks. Each edition is crafted to share trusted updates, celebrate service, and preserve the stories that define our community. Thank you for allowing us to be part of your journey."
                  )

                }
              }}
              className="w-5 h-5 accent-blue-600 rounded"
            />
            <span className="font-medium transition text-blue-600">
              Special Newsletter
            </span>

          </label>

          {/* Right side: Save button */}
          {
            isAdhoc && <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg shadow hover:bg-green-700 transition"
            >
              Save
            </button>
          }

        </div>



        <div className="max-w-7xl mx-auto bg-white border-1 border-blue-900 shadow-xl">

          <header className="bg-[#171a39] text-white px-6 py-8 pb-11 flex justify-between rounded-lg items-center">
            <img src="/mainLogo.png" alt="Logo" className="h-24" />

            <div className="flex-1 text-center">
              {isEditing ? (
                <input
                  title="ss"
                  type="text"
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  className="text-5xl font-bold text-center font-serif rounded-md p-2 text-black"
                />
              ) : (
                <h1 className="text-5xl text-center font-bold font-serif">{editableTitle}</h1>
              )}
            </div>

            <div className="flex flex-col items-end">
              <span className="text-2xl font-bold">{currentDateFormatted}</span>
            </div>
          </header>


          <div className="p-6">
            <section className="mb-8 p-0 rounded-lg">
              {/* Editable Heading */}
              {isEditingTitle ? (
                <input
                  title='text'
                  type="text"
                  value={editableMessageTitle}
                  onChange={(e) => setEditableMessageTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)} // close input on blur
                  autoFocus
                  className="text-2xl font-bold mb-4 text-gray-800 w-full rounded-md p-2 border border-gray-300"
                />
              ) : (
                <h2
                  className="text-2xl font-bold mb-4 text-gray-800 cursor-text"
                  onClick={() => setIsEditingTitle(true)}
                  title="Click to edit"
                >
                  {editableMessageTitle}
                </h2>
              )}

              {/* Editable Message */}
              {isEditingMessage ? (
                <textarea
                  title='text'
                  value={editableMessage}
                  onChange={(e) => setEditableMessage(e.target.value)}
                  onBlur={() => setIsEditingMessage(false)} // close textarea on blur
                  autoFocus
                  rows={5}
                  className="text-lg text-gray-700 leading-relaxed w-full rounded-md p-3 border border-gray-300"
                />
              ) : (
                <p
                  className="text-lg text-gray-700 leading-relaxed cursor-text"
                  onClick={() => setIsEditingMessage(true)}
                  title="Click to edit"
                >
                  {editableMessage}
                </p>
              )}
            </section>


            <hr className="border-t-2 border-gray-300 mb-8" />

            {/* Issue at a glance */}
            <section className="mb-8">
              <div className="bg-[#171a39] text-white px-3 py-3 rounded-lg w-fit">
                <h2 className="text-2xl font-bold">This Issue at a Glance</h2>
              </div>
              <div className="bg-blue-50 p-6 mt-3 rounded-lg">
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
                      <span className="text-lg text-gray-800">{article.title}</span>
                    </li>
                  ))}

                </ul>
              </div>
            </section>

            <hr className="border-t-2 border-gray-300 mb-8" />

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

                  <hr className="border-t-2 border-gray-300 mt-8" />
                </div>
              ))}

              <div className="bg-[#171a39] text-white p-6 rounded-lg flex flex-col md:flex-row justify-between items-center">

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
              </div>
            </div>
          </div>
        </div>

        {/* Floating Actions */}
        <div className="fixed bottom-5 right-5 flex flex-col items-end gap-3">
          {open && (
            <div className="flex flex-col gap-3 mb-2 animate-slide-up">
              <button
                className="flex items-center justify-center gap-2 w-[180px] h-11 bg-[#171a39] rounded-lg text-white font-medium shadow-md hover:opacity-90 transition disabled:opacity-60"
                onClick={handleExportPDF}
                disabled={exporting}
              >
                {exporting ? (
                  <>
                    <ImSpinner2 className="text-lg animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FaFilePdf className="text-lg" />
                    Export PDF
                  </>
                )}
              </button>

              <button
                onClick={() => setShowPublishOptions(true)}


                className="flex items-center justify-center gap-2 w-[180px] h-11 border-2  bg-white border-[#171a39] rounded-lg text-[#171a39] font-medium shadow-md hover:bg-[#171a39] hover:text-white transition disabled:opacity-60"
              >
                {publishing ? (
                  <>
                    <ImSpinner2 className="text-lg animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <MdPublishedWithChanges className="text-lg" />
                    Publish
                  </>
                )}
              </button>
            </div>
          )}

          {/* Floating Toggle Button */}
          <button
            className="w-14 h-14 rounded-full bg-[#171a39] text-white shadow-lg flex items-center justify-center hover:opacity-90 transition"
            onClick={() => setOpen(!open)}
          >
            {open ? <IoMdClose size={28} /> : <IoMdAdd size={28} />}
          </button>
        </div>
      </div>{/* Publish Options Popup */}

      {showPublishOptions && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg w-96 p-6 relative">
            {/* Close Button */}
            <button
              title='sdas'
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              onClick={() => setShowPublishOptions(false)}
            >
              <IoMdClose size={24} />
            </button>

            <h2 className="text-xl font-bold mb-4 text-center text-[#171a39]" >Also Publish To</h2>



            <div className="space-y-3">
              {/* ✅ Mailchimp (enabled) */}
              <label
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition ${selectedPlatforms.includes("mailchimp")
                  ? "bg-blue-100"
                  : "bg-blue-50"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes("mailchimp")}
                  onChange={() => togglePlatform("mailchimp")}
                  className="accent-blue-600"
                />
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-gray-800 font-medium">Mailchimp</span>
              </label>

              {/* 🚫 Facebook (disabled) */}
              <label className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 opacity-70 cursor-not-allowed">
                <input type="checkbox" disabled className="accent-blue-600" />
                <FaFacebook className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 font-medium">Facebook</span>
                <span className="ml-auto text-sm text-gray-500 italic">Coming Soon</span>
              </label>

              {/* 🚫 X (disabled) */}
              <label className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 opacity-70 cursor-not-allowed">
                <input type="checkbox" disabled className="accent-blue-600" />
                <FaXTwitter className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 font-medium">X (Twitter)</span>
                <span className="ml-auto text-sm text-gray-500 italic">Coming Soon</span>
              </label>

              {/* 🚫 Instagram (disabled) */}
              <label className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 opacity-70 cursor-not-allowed">
                <input type="checkbox" disabled className="accent-blue-600" />
                <FaInstagram className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 font-medium">Instagram</span>
                <span className="ml-auto text-sm text-gray-500 italic">Coming Soon</span>
              </label>

              {/* 🚫 Other Platforms (disabled) */}
              <label className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 opacity-70 cursor-not-allowed">
                <input type="checkbox" disabled className="accent-blue-600" />
                <Shield className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 font-medium">Other Platforms</span>
                <span className="ml-auto text-sm text-gray-500 italic">Coming Soon</span>
              </label>
            </div>


            {/* Confirm Publish Button */}
            <button
              onClick={handlePublishNewsletter}
              disabled={publishing}
              className="mt-6 w-full h-11 flex items-center justify-center gap-2 bg-[#171a39] text-white rounded-lg shadow hover:bg-[#0f122a] transition disabled:opacity-50"
            >
              {publishing ? (
                <>
                  <ImSpinner2 className="text-lg animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <MdPublishedWithChanges className="text-lg" />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>
      )}


    </>

  );
}
