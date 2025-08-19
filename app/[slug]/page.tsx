// // "use client";
// // import { useState, useEffect, useCallback } from 'react';
// // import { useRouter } from 'next/navigation';
// // import { Button } from '../../components/ui/button';
// // import { Mail, Phone, Shield, Globe } from 'lucide-react';

// // interface FullArticle {
// //   id: string;
// //   title: string;
// //   content: string;
// //   category: string;
// //   is_newsletter: boolean;
// //   created_at: string;
// //   byline: string;
// //   lead_paragraph: string;
// //   key_facts: string | string[];
// //   quote_block: string;
// //   cta: string;
// //   tags: string;
// //   image_url: string;
// //   is_auto_generated?: boolean;
// //   conversation_session?: string;
// // }

// // // Helper function to format date as DD-month-YYYY (e.g., 11-august-2025)
// // const formatDateForSlug = (date: Date): string => {
// //   const day = date.getDate().toString().padStart(2, '0');
// //   const month = date.toLocaleString('en-AU', { month: 'long' }).toLowerCase();
// //   const year = date.getFullYear();
// //   return `tpi-newsletter-publisheddate-${day}-${month}-${year}`;
// // };

// // export default function NewsletterPublish({ params }: { params: { slug: string } }) {
// //   const [error, setError] = useState<string | null>(null);
// //   const [publishedArticles, setPublishedArticles] = useState<FullArticle[]>([]);
// //   const [failedArticleIds, setFailedArticleIds] = useState<string[]>([]);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const router = useRouter();
// //   const [articleIds, setArticleIds] = useState<string[]>([]);

// //   // Generate the expected slug for validation
// //   const currentDate = new Date();
// //   const expectedSlug = formatDateForSlug(currentDate);

// //   useEffect(() => {
// //     // Validate the slug; redirect to correct URL if it doesn't match
// //     if (params.slug !== expectedSlug) {
// //       router.replace(`/${expectedSlug}`);
// //       return;
// //     }

// //     if (typeof window !== "undefined") {
// //       try {
// //         const savedPublishedIds = localStorage.getItem("publishedArticleIds");
// //         const parsedIds = savedPublishedIds ? JSON.parse(savedPublishedIds) : [];
// //         if (Array.isArray(parsedIds)) {
// //           setArticleIds(parsedIds);
// //         }
// //       } catch (err) {
// //         console.error("Error parsing publishedArticleIds from localStorage:", err);
// //       }
// //     }
// //   }, [params.slug, router]);

// //   const formatKeyFacts = (keyFacts: string | string[] | undefined): string[] => {
// //     if (!keyFacts) return [];
// //     if (Array.isArray(keyFacts)) {
// //       return keyFacts.filter((fact) => fact.trim()).map((fact) => fact.trim());
// //     }
// //     try {
// //       const parsed = JSON.parse(keyFacts);
// //       if (Array.isArray(parsed)) {
// //         return parsed.filter((fact: string) => fact.trim()).map((fact: string) => fact.trim());
// //       }
// //     } catch {
// //       return keyFacts.split("\n").filter((fact) => fact.trim()).map((fact) => fact.trim());
// //     }
// //     return [];
// //   };

// //   const clearError = () => setTimeout(() => setError(null), 5000);

// //   useEffect(() => {
// //     let isMounted = true;

// //     const fetchArticles = async () => {
// //       if (articleIds.length === 0) return;
// //       setIsLoading(true);
// //       setError(null);
// //       setFailedArticleIds([]);
// //       try {
// //         const token = localStorage.getItem("token");
// //         if (!token) {
// //           setError("Authentication required");
// //           clearError();
// //           router.push("/");
// //           return;
// //         }
// //         const articlePromises = articleIds.map((id) =>
// //           fetch(`https://tpi-backend-deployed-production.up.railway.app/api/articles/${id}/`, {
// //             method: "GET",
// //             headers: { Authorization: `Token ${token}` },
// //           }).then(async (response) => {
// //             if (!response.ok) {
// //               if (response.status === 401) {
// //                 setError("Authentication failed. Please log in again.");
// //                 clearError();
// //                 localStorage.removeItem("token");
// //                 router.push("/");
// //                 throw new Error("Unauthorized");
// //               }
// //               setFailedArticleIds((prev) => [...prev, id]);
// //               return null;
// //             }
// //             return response.json();
// //           })
// //         );
// //         const articles = await Promise.all(articlePromises);
// //         const orderedArticles = articleIds
// //           .map((id, index) => articles[index])
// //           .filter((article): article is FullArticle => !!article);
// //         if (isMounted) {
// //           setPublishedArticles(orderedArticles);
// //         }
// //       } catch (err) {
// //         if (isMounted) {
// //           setError(`Failed to load articles: ${err instanceof Error ? err.message : "Unknown error"}`);
// //           clearError();
// //         }
// //       } finally {
// //         if (isMounted) {
// //           setIsLoading(false);
// //         }
// //       }
// //     };

// //     fetchArticles();

// //     return () => {
// //       isMounted = false;
// //     };
// //   }, [articleIds, router]);

// //   const handleUnpublish = useCallback(async () => {
// //     if (publishedArticles.length === 0) {
// //       setError("No articles to unpublish");
// //       clearError();
// //       return;
// //     }
// //     if (!confirm(`Are you sure you want to unpublish ${publishedArticles.length} article${publishedArticles.length > 1 ? 's' : ''}?`)) return;
// //     setIsLoading(true);
// //     setError(null);
// //     try {
// //       const token = localStorage.getItem("token");
// //       if (!token) {
// //         setError("Authentication required");
// //         clearError();
// //         router.push("/");
// //         return;
// //       }
// //       const unpublishPromises = publishedArticles.map((article) =>
// //         fetch(`https://tpi-backend-deployed-production.up.railway.app/api/articles/${article.id}/`, {
// //           method: "PUT",
// //           headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
// //           body: JSON.stringify({ ...article, is_newsletter: false }),
// //         }).then(async (response) => {
// //           if (!response.ok) {
// //             if (response.status === 401) {
// //               setError("Authentication failed. Please log in again.");
// //               clearError();
// //               localStorage.removeItem("token");
// //               router.push("/");
// //               throw new Error("Unauthorized");
// //             }
// //             throw new Error(`Failed to unpublish article ${article.id}`);
// //           }
// //           return response.json();
// //         })
// //       );
// //       await Promise.all(unpublishPromises);
// //       setPublishedArticles([]);
// //       setFailedArticleIds([]);
// //       localStorage.setItem("publishedArticleIds", JSON.stringify([]));
// //       router.push("/dashboard");
// //     } catch (err) {
// //       setError(`Failed to unpublish articles: ${err instanceof Error ? err.message : "Unknown error"}`);
// //       clearError();
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   }, [publishedArticles, router]);

// //   const handleArticleClick = useCallback(async (article: FullArticle) => {
// //     router.push(`/article/${article.id}`);
// //   }, [router]);

// //   const currentDateFormatted = currentDate.toLocaleDateString("en-AU", {
// //     day: "numeric",
// //     month: "long",
// //     year: "numeric",
// //   });

// //   if (isLoading) {
// //     return (
// //       <div className="min-h-screen bg-white flex items-center justify-center">
// //         <p className="text-gray-800 text-lg">Loading articles...</p>
// //       </div>
// //     );
// //   }

// //   if (publishedArticles.length === 0 && failedArticleIds.length === 0) {
// //     return (
// //       <div className="min-h-screen bg-white flex items-center justify-center">
// //         <p className="text-gray-800 text-lg">No published articles found.</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
// //       <div className="max-w-7xl mx-auto bg-white border-1 border-blue-900 shadow-xl">
// //         <header className="bg-[#004682] text-white px-6 py-8 flex justify-between rounded-lg items-center">
// //           <img src="/logo-white 1.svg" alt="Logo" className="h-24" />
// //           <h1 className="text-5xl text-center font-bold flex-1 font-serif">TPI Newsletter</h1>
// //           <span className="text-2xl font-bold">{currentDateFormatted}</span>
// //         </header>

// //         <div className="p-6">
// //           <section className="mb-8 p-6 rounded-lg">
// //             <h2 className="text-2xl font-bold mb-4 text-gray-800">Editor's Message</h2>
// //             <p className="text-lg text-gray-700 leading-relaxed">
// //               Welcome to our newsletter — a space dedicated to informing, honouring, and connecting Australia’s totally and permanently incapacitated veterans, along with their families and support networks. Each edition is crafted to share trusted updates, celebrate service, and preserve the stories that define our community. Thank you for allowing us to be part of your journey.
// //             </p>
// //           </section>

// //           <hr className="border-t-2 border-gray-300 mb-8" />

// //           <section className="mb-8">
// //             <div className="bg-[#004682] text-white px-3 py-3 rounded-lg w-fit">
// //               <h2 className="text-2xl font-bold">This Issue at a Glance</h2>
// //             </div>
// //             <div className="bg-blue-50 p-6 rounded-b-lg">
// //               <ul className="space-y-3">
// //                 {publishedArticles.map((article, index) => (
// //                   <li key={article.id} className="flex items-center">
// //                     <svg
// //                       className="w-5 h-4 mr-3 flex-shrink-0 transform rotate-45 align-middle"
// //                       fill="none"
// //                       stroke="#132A36"
// //                       viewBox="0 0 8 8"
// //                     >
// //                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 4h5M4 1l3 3-3 3" />
// //                     </svg>
// //                     <span
// //                       className="text-lg text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
// //                       onClick={() => handleArticleClick(article)}
// //                     >
// //                       {article.title}
// //                     </span>
// //                   </li>
// //                 ))}
// //                 {articleIds.length < 3 &&
// //                   Array.from({ length: 3 - articleIds.length }).map((_, index) => (
// //                     <li key={`empty-${index}`} className="flex items-center">
// //                       <svg
// //                         className="w-5 h-4 mr-3 flex-shrink-0 transform rotate-45 align-middle"
// //                         fill="none"
// //                         stroke="#A0AEC0"
// //                         viewBox="0 0 8 8"
// //                       >
// //                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 4h5M4 1l3 3-3 3" />
// //                       </svg>
// //                       <span className="text-lg text-gray-500">
// //                         Article Slot {articleIds.length + index + 1}: Empty
// //                       </span>
// //                     </li>
// //                   ))}
// //               </ul>
// //             </div>
// //           </section>

// //           <hr className="border-t-2 border-gray-300 mb-8" />

// //           {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
// //           {failedArticleIds.length > 0 && (
// //             <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
// //               Failed to load articles with IDs: {failedArticleIds.join(", ")}
// //             </div>
// //           )}

// //           <div className="max-w-7xl mx-auto">
// //             {publishedArticles.map((article, index) => (
// //               <div key={article.id} className="mb-12">
// //                 <div className="mb-4">
// //                   <h2 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
// //                     {article.title}
// //                   </h2>
// //                 </div>

// //                 <div className="mb-6 relative">
// //                   <img
// //                     src={article.image_url || "/placeholder.svg?height=300&width=800&text=Placeholder"}
// //                     alt={`Article ${index + 1} Hero`}
// //                     className="w-full h-56 object-cover rounded-lg shadow-md"
// //                   />
// //                 </div>

// //                 <div className="mb-6">
// //                   <p className="text-gray-600 italic">{article.byline}</p>
// //                 </div>

// //                 <div className="mb-6">
// //                   <p className="text-lg font-bold text-gray-800 leading-relaxed">{article.lead_paragraph}</p>
// //                 </div>

// //                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //                   <div className="lg:col-span-2 text-justify">
// //                     <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">{article.content}</div>
// //                   </div>
// //                   <div className="lg:col-span-1 space-y-6">
// //                     <div className="bg-gray-100 shadow-md rounded-lg border border-gray-200 overflow-hidden">
// //                       <div className="bg-gray-200 px-4 py-3 border-b border-gray-200">
// //                         <h3 className="font-bold text-gray-800">Key Facts</h3>
// //                       </div>
// //                       <div className="p-4">
// //                         {formatKeyFacts(article.key_facts).length > 0 ? (
// //                           <ul className="space-y-2 list-disc pl-5">
// //                             {formatKeyFacts(article.key_facts).map((fact, idx) => (
// //                               <li key={idx} className="text-sm text-gray-700 leading-relaxed">{fact}</li>
// //                             ))}
// //                           </ul>
// //                         ) : (
// //                           <p className="text-sm text-gray-500">No key facts available.</p>
// //                         )}
// //                       </div>
// //                     </div>

// //                     <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg">
// //                       <div className="p-4">
// //                         <blockquote className="text-sm italic text-gray-700 relative">
// //                           <span className="text-3xl text-[#004682] absolute -top-2 -left-1">"</span>
// //                           <span className="pl-6 block">{article.quote_block}</span>
// //                           <span className="text-3xl text-[#004682] absolute -bottom-2 -right-1">"</span>
// //                         </blockquote>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <div className="mt-6 pt-4 border-t border-gray-200">
// //                   <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
// //                     <div className="flex items-center space-x-4">
// //                       <span>Topic: {article.tags}</span>
// //                       <span>
// //                         {article.created_at
// //                           ? new Date(article.created_at).toLocaleDateString("en-AU", { year: "numeric", month: "2-digit", day: "2-digit" })
// //                           : new Date().toLocaleDateString("en-AU", { year: "numeric", month: "2-digit", day: "2-digit" })}
// //                       </span>
// //                       <span>Source: TPI News</span>
// //                     </div>
// //                     <div>
// //                       <a href={article.cta} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
// //                         {article.cta}
// //                       </a>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 <hr className="border-t-2 border-gray-300 mt-8" />
// //               </div>
// //             ))}

// //             <div className="bg-[#004682] text-white p-6 rounded-lg flex flex-col md:flex-row justify-between items-center">
// //               <div className="space-y-2">
// //                 <div className="flex items-center space-x-2">
// //                   <Shield className="h-5 w-5" />
// //                   <span className="font-bold">Veteran Support Line</span>
// //                 </div>
// //                 <p>National Veterans Helpline</p>
// //                 <p>PO Box 400, Adelaide SA 5000</p>
// //                 <p className="flex items-center space-x-2">
// //                   <Phone className="h-5 w-5" />
// //                   <span>Freecall: 1800 VET HELP (1800 838 4357)</span>
// //                 </p>
// //                 <p className="flex items-center space-x-2">
// //                   <Mail className="h-5 w-5" />
// //                   <span>Email: support@veteranshelp.org</span>
// //                 </p>
// //                 <p className="flex items-center space-x-2">
// //                   <Globe className="h-5 w-5" />
// //                   <span>Website: veteranshelp.org</span>
// //                 </p>
// //               </div>
// //               <img src="/logo-white 1.svg" alt="Logo" className="h-24 mt-4 md:mt-0" />
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// "use client";
// import { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import { Button } from '../../components/ui/button';
// import { Mail, Phone, Shield, Globe } from 'lucide-react';
// import { use } from 'react';

// interface FullArticle {
//   id: string;
//   title: string;
//   content: string;
//   category: string;
//   is_newsletter: boolean;
//   created_at: string;
//   byline: string;
//   lead_paragraph: string;
//   key_facts: string | string[];
//   quote_block: string;
//   cta: string;
//   tags: string;
//   image_url: string;
//   is_auto_generated?: boolean;
//   conversation_session?: string;
// }

// // Helper function to format date as DD-month-YYYY (e.g., 12-august-2025)
// const formatDateForSlug = (date: Date): string => {
//   const day = date.getDate().toString().padStart(2, '0');
//   const month = date.toLocaleString('en-AU', { month: 'long' }).toLowerCase();
//   const year = date.getFullYear();
//   return `tpi-newsletter-publisheddate-${day}-${month}-${year}`;
// };

// export default function NewsletterPublish({ params }: { params: Promise<{ slug: string }> }) {
//   const [error, setError] = useState<string | null>(null);
//   const [publishedArticles, setPublishedArticles] = useState<FullArticle[]>([]);
//   const [failedArticleIds, setFailedArticleIds] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();
//   const [articleIds, setArticleIds] = useState<string[]>([]);

//   // Unwrap params using React.use()
//   const { slug } = use(params);

//   // Generate the expected slug for validation
//   const currentDate = new Date();
//   const expectedSlug = formatDateForSlug(currentDate);

//   useEffect(() => {
//     // Validate the slug; redirect to correct URL if it doesn't match
//     if (slug !== expectedSlug) {
//       router.replace(`/${expectedSlug}`);
//       return;
//     }

//     if (typeof window !== "undefined") {
//       try {
//         const savedPublishedIds = localStorage.getItem("publishedArticleIds");
//         const parsedIds = savedPublishedIds ? JSON.parse(savedPublishedIds) : [];
//         if (Array.isArray(parsedIds)) {
//           setArticleIds(parsedIds);
//         }
//       } catch (err) {
//         console.error("Error parsing publishedArticleIds from localStorage:", err);
//       }
//     }
//   }, [slug, router]);

//   const formatKeyFacts = (keyFacts: string | string[] | undefined): string[] => {
//     if (!keyFacts) return [];
//     if (Array.isArray(keyFacts)) {
//       return keyFacts.filter((fact) => fact.trim()).map((fact) => fact.trim());
//     }
//     try {
//       const parsed = JSON.parse(keyFacts);
//       if (Array.isArray(parsed)) {
//         return parsed.filter((fact: string) => fact.trim()).map((fact: string) => fact.trim());
//       }
//     } catch {
//       return keyFacts.split("\n").filter((fact) => fact.trim()).map((fact) => fact.trim());
//     }
//     return [];
//   };

//   const clearError = () => setTimeout(() => setError(null), 5000);

//   useEffect(() => {
//     let isMounted = true;

//     const fetchArticles = async () => {
//       if (articleIds.length === 0) return;
//       setIsLoading(true);
//       setError(null);
//       setFailedArticleIds([]);
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           setError("Authentication required");
//           clearError();
//           router.push("/");
//           return;
//         }
//         const articlePromises = articleIds.map((id) =>
//           fetch(`https://tpi-backend-deployed-production.up.railway.app/api/articles/${id}/`, {
//             method: "GET",
//             headers: { Authorization: `Token ${token}` },
//           }).then(async (response) => {
//             if (!response.ok) {
//               if (response.status === 401) {
//                 setError("Authentication failed. Please log in again.");
//                 clearError();
//                 localStorage.removeItem("token");
//                 router.push("/");
//                 throw new Error("Unauthorized");
//               }
//               setFailedArticleIds((prev) => [...prev, id]);
//               return null;
//             }
//             return response.json();
//           })
//         );
//         const articles = await Promise.all(articlePromises);
//         const orderedArticles = articleIds
//           .map((id, index) => articles[index])
//           .filter((article): article is FullArticle => !!article);
//         if (isMounted) {
//           setPublishedArticles(orderedArticles);
//         }
//       } catch (err) {
//         if (isMounted) {
//           setError(`Failed to load articles: ${err instanceof Error ? err.message : "Unknown error"}`);
//           clearError();
//         }
//       } finally {
//         if (isMounted) {
//           setIsLoading(false);
//         }
//       }
//     };

//     fetchArticles();

//     return () => {
//       isMounted = false;
//     };
//   }, [articleIds, router]);

//   const handleUnpublish = useCallback(async () => {
//     if (publishedArticles.length === 0) {
//       setError("No articles to unpublish");
//       clearError();
//       return;
//     }
//     if (!confirm(`Are you sure you want to unpublish ${publishedArticles.length} article${publishedArticles.length > 1 ? 's' : ''}?`)) return;
//     setIsLoading(true);
//     setError(null);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("Authentication required");
//         clearError();
//         router.push("/");
//         return;
//       }
//       const unpublishPromises = publishedArticles.map((article) =>
//         fetch(`https://tpi-backend-deployed-production.up.railway.app/api/articles/${article.id}/`, {
//           method: "PUT",
//           headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
//           body: JSON.stringify({ ...article, is_newsletter: false }),
//         }).then(async (response) => {
//           if (!response.ok) {
//             if (response.status === 401) {
//               setError("Authentication failed. Please log in again.");
//               clearError();
//               localStorage.removeItem("token");
//               router.push("/");
//               throw new Error("Unauthorized");
//             }
//             throw new Error(`Failed to unpublish article ${article.id}`);
//           }
//           return response.json();
//         })
//       );
//       await Promise.all(unpublishPromises);
//       setPublishedArticles([]);
//       setFailedArticleIds([]);
//       localStorage.setItem("publishedArticleIds", JSON.stringify([]));
//       router.push("/dashboard");
//     } catch (err) {
//       setError(`Failed to unpublish articles: ${err instanceof Error ? err.message : "Unknown error"}`);
//       clearError();
//     } finally {
//       setIsLoading(false);
//     }
//   }, [publishedArticles, router]);

//   const handleArticleClick = useCallback(async (article: FullArticle) => {
//     router.push(`/article/${article.id}`);
//   }, [router]);

//   const currentDateFormatted = currentDate.toLocaleDateString("en-AU", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   });

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <p className="text-gray-800 text-lg">Loading articles...</p>
//       </div>
//     );
//   }

//   if (publishedArticles.length === 0 && failedArticleIds.length === 0) {
//     return (
//       <div className="min-h-screen bg-white flex items-center justify-center">
//         <p className="text-gray-800 text-lg">No published articles found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
//       <div className="max-w-7xl mx-auto bg-white border-1 border-blue-900 shadow-xl">
//         <header className="bg-[#004682] text-white px-6 py-8 flex justify-between rounded-lg items-center">
//           <img src="/logo-white 1.svg" alt="Logo" className="h-24" />
//           <h1 className="text-5xl text-center font-bold flex-1 font-serif">TPI Newsletter</h1>
//           <span className="text-2xl font-bold">{currentDateFormatted}</span>
//         </header>

//         <div className="p-6">
//           <section className="mb-8 p-6 rounded-lg">
//             <h2 className="text-2xl font-bold mb-4 text-gray-800">Editor's Message</h2>
//             <p className="text-lg text-gray-700 leading-relaxed">
//               Welcome to our newsletter — a space dedicated to informing, honouring, and connecting Australia’s totally and permanently incapacitated veterans, along with their families and support networks. Each edition is crafted to share trusted updates, celebrate service, and preserve the stories that define our community. Thank you for allowing us to be part of your journey.
//             </p>
//           </section>

//           <hr className="border-t-2 border-gray-300 mb-8" />

//           <section className="mb-8">
//             <div className="bg-[#004682] text-white px-3 py-3 rounded-lg w-fit">
//               <h2 className="text-2xl font-bold">This Issue at a Glance</h2>
//             </div>
//             <div className="bg-blue-50 p-6 rounded-b-lg">
//               <ul className="space-y-3">
//                 {publishedArticles.map((article, index) => (
//                   <li key={article.id} className="flex items-center">
//                     <svg
//                       className="w-5 h-4 mr-3 flex-shrink-0 transform rotate-45 align-middle"
//                       fill="none"
//                       stroke="#132A36"
//                       viewBox="0 0 8 8"
//                     >
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 4h5M4 1l3 3-3 3" />
//                     </svg>
//                     <span
//                       className="text-lg text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
//                       onClick={() => handleArticleClick(article)}
//                     >
//                       {article.title}
//                     </span>
//                   </li>
//                 ))}
//                 {articleIds.length < 3 &&
//                   Array.from({ length: 3 - articleIds.length }).map((_, index) => (
//                     <li key={`empty-${index}`} className="flex items-center">
//                       <svg
//                         className="w-5 h-4 mr-3 flex-shrink-0 transform rotate-45 align-middle"
//                         fill="none"
//                         stroke="#A0AEC0"
//                         viewBox="0 0 8 8"
//                       >
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 4h5M4 1l3 3-3 3" />
//                       </svg>
//                       <span className="text-lg text-gray-500">
//                         Article Slot {articleIds.length + index + 1}: Empty
//                       </span>
//                     </li>
//                   ))}
//               </ul>
//             </div>
//           </section>

//           <hr className="border-t-2 border-gray-300 mb-8" />

//           {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
//           {failedArticleIds.length > 0 && (
//             <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
//               Failed to load articles with IDs: {failedArticleIds.join(", ")}
//             </div>
//           )}

//           <div className="max-w-7xl mx-auto">
//             {publishedArticles.map((article, index) => (
//               <div key={article.id} className="mb-12">
//                 <div className="mb-4">
//                   <h2 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
//                     {article.title}
//                   </h2>
//                 </div>

//                 <div className="mb-6 relative">
//                   <img
//                     src={article.image_url || "/placeholder.svg?height=300&width=800&text=Placeholder"}
//                     alt={`Article ${index + 1} Hero`}
//                     className="w-full h-56 object-cover rounded-lg shadow-md"
//                   />
//                 </div>

//                 <div className="mb-6">
//                   <p className="text-gray-600 italic">{article.byline}</p>
//                 </div>

//                 <div className="mb-6">
//                   <p className="text-lg font-bold text-gray-800 leading-relaxed">{article.lead_paragraph}</p>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                   <div className="lg:col-span-2 text-justify">
//                     <div className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">{article.content}</div>
//                   </div>
//                   <div className="lg:col-span-1 space-y-6">
//                     <div className="bg-gray-100 shadow-md rounded-lg border border-gray-200 overflow-hidden">
//                       <div className="bg-gray-200 px-4 py-3 border-b border-gray-200">
//                         <h3 className="font-bold text-gray-800">Key Facts</h3>
//                       </div>
//                       <div className="p-4">
//                         {formatKeyFacts(article.key_facts).length > 0 ? (
//                           <ul className="space-y-2 list-disc pl-5">
//                             {formatKeyFacts(article.key_facts).map((fact, idx) => (
//                               <li key={idx} className="text-sm text-gray-700 leading-relaxed">{fact}</li>
//                             ))}
//                           </ul>
//                         ) : (
//                           <p className="text-sm text-gray-500">No key facts available.</p>
//                         )}
//                       </div>
//                     </div>

//                     <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg">
//                       <div className="p-4">
//                         <blockquote className="text-sm italic text-gray-700 relative">
//                           <span className="text-3xl text-[#004682] absolute -top-2 -left-1">"</span>
//                           <span className="pl-6 block">{article.quote_block}</span>
//                           <span className="text-3xl text-[#004682] absolute -bottom-2 -right-1">"</span>
//                         </blockquote>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-6 pt-4 border-t border-gray-200">
//                   <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
//                     <div className="flex items-center space-x-4">
//                       <span>Topic: {article.tags}</span>
//                       <span>
//                         {article.created_at
//                           ? new Date(article.created_at).toLocaleDateString("en-AU", { year: "numeric", month: "2-digit", day: "2-digit" })
//                           : new Date().toLocaleDateString("en-AU", { year: "numeric", month: "2-digit", day: "2-digit" })}
//                       </span>
//                       <span>Source: TPI News</span>
//                     </div>
//                     <div>
//                       <a href={article.cta} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
//                         {article.cta}
//                       </a>
//                     </div>
//                   </div>
//                 </div>

//                 <hr className="border-t-2 border-gray-300 mt-8" />
//               </div>
//             ))}

//             <div className="bg-[#004682] text-white p-6 rounded-lg flex flex-col md:flex-row justify-between items-center">
//               <div className="space-y-2">
//                 <div className="flex items-center space-x-2">
//                   <Shield className="h-5 w-5" />
//                   <span className="font-bold">Veteran Support Line</span>
//                 </div>
//                 <p>National Veterans Helpline</p>
//                 <p>PO Box 400, Adelaide SA 5000</p>
//                 <p className="flex items-center space-x-2">
//                   <Phone className="h-5 w-5" />
//                   <span>Freecall: 1800 VET HELP (1800 838 4357)</span>
//                 </p>
//                 <p className="flex items-center space-x-2">
//                   <Mail className="h-5 w-5" />
//                   <span>Email: support@veteranshelp.org</span>
//                 </p>
//                 <p className="flex items-center space-x-2">
//                   <Globe className="h-5 w-5" />
//                   <span>Website: veteranshelp.org</span>
//                 </p>
//               </div>
//               <img src="/logo-white 1.svg" alt="Logo" className="h-24 mt-4 md:mt-0" />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Optional: Generate metadata for SEO
// export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
//   const { slug } = await params; // Unwrap params for metadata
//   const date = new Date();
//   return {
//     title: `TPI Newsletter - ${date.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}`,
//     description: 'TPI Newsletter for veterans and their families.',
//   };
// }












"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Mail, Phone, Shield, Globe } from 'lucide-react';
import { use } from 'react';

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
}

// Helper function to format date as DD-month-YYYY (e.g., 12-august-2025)
const formatDateForSlug = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-AU', { month: 'long' }).toLowerCase();
  const year = date.getFullYear();
  return `tpi-newsletter-publisheddate-${day}-${month}-${year}`;
};

export default function NewsletterPublish({ params }: { params: Promise<{ slug: string }> }) {
  const [error, setError] = useState<string | null>(null);
  const [publishedArticles, setPublishedArticles] = useState<FullArticle[]>([]);
  const [failedArticleIds, setFailedArticleIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [articleIds, setArticleIds] = useState<string[]>([]);

  // Unwrap params using React.use()
  const { slug } = use(params);

  // Generate the expected slug for validation
  const currentDate = new Date();
  const expectedSlug = formatDateForSlug(currentDate);

  useEffect(() => {
    // Validate the slug; redirect to correct URL if it doesn't match
    if (slug !== expectedSlug) {
      router.replace(`/${expectedSlug}`);
      return;
    }

    if (typeof window !== "undefined") {
      try {
        const savedPublishedIds = localStorage.getItem("publishedArticleIds");
        const parsedIds = savedPublishedIds ? JSON.parse(savedPublishedIds) : [];
        if (Array.isArray(parsedIds)) {
          setArticleIds(parsedIds);
        }
      } catch (err) {
        console.error("Error parsing publishedArticleIds from localStorage:", err);
      }
    }
  }, [slug, router]);

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

  const clearError = () => setTimeout(() => setError(null), 5000);

  useEffect(() => {
    let isMounted = true;

    const fetchArticles = async () => {
      if (articleIds.length === 0) return;
      setIsLoading(true);
      setError(null);
      setFailedArticleIds([]);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required");
          clearError();
          router.push("/");
          return;
        }
        const articlePromises = articleIds.map((id) =>
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${id}/`, {
            method: "GET",
            headers: { Authorization: `Token ${token}` },
          }).then(async (response) => {
            if (!response.ok) {
              if (response.status === 401) {
                setError("Authentication failed. Please log in again.");
                clearError();
                localStorage.removeItem("token");
                router.push("/");
                throw new Error("Unauthorized");
              }
              setFailedArticleIds((prev) => [...prev, id]);
              return null;
            }
            return response.json();
          })
        );
        const articles = await Promise.all(articlePromises);
        const orderedArticles = articleIds
          .map((id, index) => articles[index])
          .filter((article): article is FullArticle => !!article);
        if (isMounted) {
          setPublishedArticles(orderedArticles);
        }
      } catch (err) {
        if (isMounted) {
          setError(`Failed to load articles: ${err instanceof Error ? err.message : "Unknown error"}`);
          clearError();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchArticles();

    return () => {
      isMounted = false;
    };
  }, [articleIds, router]);

  const handleUnpublish = useCallback(async () => {
    if (publishedArticles.length === 0) {
      setError("No articles to unpublish");
      clearError();
      return;
    }
    if (!confirm(`Are you sure you want to unpublish ${publishedArticles.length} article${publishedArticles.length > 1 ? 's' : ''}?`)) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        clearError();
        router.push("/");
        return;
      }
      const unpublishPromises = publishedArticles.map((article) =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${article.id}/`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Token ${token}` },
          body: JSON.stringify({ ...article, is_newsletter: false }),
        }).then(async (response) => {
          if (!response.ok) {
            if (response.status === 401) {
              setError("Authentication failed. Please log in again.");
              clearError();
              localStorage.removeItem("token");
              router.push("/");
              throw new Error("Unauthorized");
            }
            throw new Error(`Failed to unpublish article ${article.id}`);
          }
          return response.json();
        })
      );
      await Promise.all(unpublishPromises);
      setPublishedArticles([]);
      setFailedArticleIds([]);
      localStorage.setItem("publishedArticleIds", JSON.stringify([]));
      router.push("/dashboard");
    } catch (err) {
      setError(`Failed to unpublish articles: ${err instanceof Error ? err.message : "Unknown error"}`);
      clearError();
    } finally {
      setIsLoading(false);
    }
  }, [publishedArticles, router]);

  const currentDateFormatted = currentDate.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-800 text-lg">Loading articles...</p>
      </div>
    );
  }

  if (publishedArticles.length === 0 && failedArticleIds.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-800 text-lg">No published articles found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto bg-white border-1 border-blue-900 shadow-xl">
        <header className="bg-[#004682] text-white px-6 py-8 flex justify-between rounded-lg items-center">
          <img src="/logo-white 1.svg" alt="Logo" className="h-24" />
          <h1 className="text-5xl text-center font-bold flex-1 font-serif">TPI Newsletter</h1>
          <span className="text-2xl font-bold">{currentDateFormatted}</span>
        </header>

        <div className="p-6">
          <section className="mb-8 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Editor's Message</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Welcome to our newsletter — a space dedicated to informing, honouring, and connecting Australia’s totally and permanently incapacitated veterans, along with their families and support networks. Each edition is crafted to share trusted updates, celebrate service, and preserve the stories that define our community. Thank you for allowing us to be part of your journey.
            </p>
          </section>

          <hr className="border-t-2 border-gray-300 mb-8" />

          <section className="mb-8">
            <div className="bg-[#004682] text-white px-3 py-3 rounded-lg w-fit">
              <h2 className="text-2xl font-bold">This Issue at a Glance</h2>
            </div>
            <div className="bg-blue-50 p-6 rounded-b-lg">
              <ul className="space-y-3">
                {publishedArticles.map((article, index) => (
                  <li key={article.id} className="flex items-center">
                    <svg
                      className="w-5 h-4 mr-3 flex-shrink-0 transform rotate-45 align-middle"
                      fill="none"
                      stroke="#132A36"
                      viewBox="0 0 8 8"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M1 4h5M4 1l3 3-3 3" />
                    </svg>
                    <span className="text-lg text-gray-800">
                      {article.title}
                    </span>
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
                      <span className="text-lg text-gray-500">
                        Article Slot {articleIds.length + index + 1}: Empty
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </section>

          <hr className="border-t-2 border-gray-300 mb-8" />

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
          {failedArticleIds.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
              Failed to load articles with IDs: {failedArticleIds.join(", ")}
            </div>
          )}

          <div className="max-w-7xl mx-auto">
            {publishedArticles.map((article, index) => (
              <div key={article.id} className="mb-12">
                <div className="mb-4">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
                    {article.title}
                  </h2>
                </div>

                {article.image_url && (
                  <div className="mb-6 relative">
                    <img
                      src={article.image_url}
                      alt={`Article ${index + 1} Hero`}
                      className="w-full h-56 object-cover rounded-lg shadow-md"
                    />
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
                      <a href={article.cta} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {article.cta}
                      </a>
                    </div>
                  </div>
                </div>

                <hr className="border-t-2 border-gray-300 mt-8" />
              </div>
            ))}

            <div className="bg-[#004682] text-white p-6 rounded-lg flex flex-col md:flex-row justify-between items-center">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span className="font-bold">Veteran Support Line</span>
                </div>
                <p>National Veterans Helpline</p>
                <p>PO Box 400, Adelaide SA 5000</p>
                <p className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Freecall: 1800 VET HELP (1800 838 4357)</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Email: support@veteranshelp.org</span>
                </p>
                <p className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Website: veteranshelp.org</span>
                </p>
              </div>
              <img src="/logo-white 1.svg" alt="Logo" className="h-24 mt-4 md:mt-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
