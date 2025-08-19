"use client"; // This is required for client-side rendering

import React, { use, useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import ArticlePDF, { ArticlePDFProps } from "../dashboard/ArticlePDF";
import { NewsletterPDF } from "../[slug]/NewsletterPDF";
import { useRouter } from "next/navigation";

// Static PDF props

const pdfProps: ArticlePDFProps = {
  currentArticle: {
    image_url: "", // Article Hero Image
    created_at: "2025-08-18",
  },
  editedTitle: "Repatriation Medical Authority: A Pillar of Support for Australian Veterans",
  editedByline: "By TPI Overwatch",
  editedLeadParagraph:
    "The Repatriation Medical Authority (RMA), a pivotal entity within Australia's veteran support system, ensures that veterans' health conditions are assessed with precision and fairness. Recently, the RMA has updated several Statements of Principles (SOPs) to include the latest medical research, ensuring that veterans receive accurate and just evaluations.",
  editedContent: `
The Repatriation Medical Authority (RMA) stands as a cornerstone in the framework supporting Australian veterans, particularly those who are Totally and Permanently Incapacitated (TPI). Established to ensure that veterans receive fair and evidence-based assessments of medical conditions related to their service, the RMA plays a crucial role in the veterans' benefits system administered by the Department of Veterans' Affairs (DVA).

The RMA is responsible for determining Statements of Principles (SOPs) which are legislative instruments that provide the legal basis for deciding claims for pensions and other benefits. These SOPs outline the connection between specific medical conditions and service, classified under two standards: the 'reasonable hypothesis' and the 'balance of probabilities'. This dual standard ensures that veterans are assessed with fairness, acknowledging the complexity and uniqueness of each case.

A recent development in the RMA's operations includes the integration of contemporary medical research and the adaptation of SOPs to better align with current medical understanding. For instance, as of September 2022, SOPs for conditions like myasthenia gravis have been updated to reflect the latest findings, ensuring that veterans receive the most accurate assessments possible.

Moreover, the RMA's work is critical in the context of hearing-related conditions. The 'Work Health and Safety (Managing Noise and Preventing Hearing Loss at Work) Code of Practice 2015' is a perfect example of how the RMA incorporates occupational health standards into its SOPs. This ensures that veterans who have been exposed to harmful noise levels during service can access appropriate support and compensation.

The RMA's commitment to veterans is underscored by the words of Ken Doolan: "Veterans carry the burden of our freedom. We owe them not just thanks but action." This sentiment captures the essence of what the RMA strives to achieve—a proactive approach in supporting those who have served the nation.

Historically, the RMA was established to address inconsistencies and ensure that decisions regarding veterans' health claims are made transparently and based on robust evidence. This has been particularly beneficial for TPI veterans, who often face complex medical challenges that require comprehensive evaluation.

As Australia continues to honour its veterans, the RMA's role becomes even more significant. With an increasing focus on mental health and the long-term impacts of service, the RMA is tasked with continually updating and refining SOPs to address emerging health issues. This ongoing process not only meets the immediate needs of veterans but also anticipates future challenges.

In conclusion, the RMA remains a vital institution for Australian veterans, providing essential support through its evidence-based SOPs. As the landscape of veterans' health care evolves, the RMA's commitment to adapting and improving its practices ensures that veterans receive the care and recognition they deserve. For those interested in learning more or engaging with the RMA, reviewing the latest SOPs or participating in public consultations can be valuable steps in understanding and contributing to this crucial work.
`,
  editedKeyFacts: [
    "The RMA is responsible for creating SOPs that guide the assessment of veterans' medical conditions related to their service.",
    "SOPs are based on two standards: 'reasonable hypothesis' and 'balance of probabilities'.",
    "Recent updates to SOPs, such as those for myasthenia gravis, reflect the latest medical research.",
    "The RMA incorporates occupational health standards, such as those from the 'Work Health and Safety (Managing Noise and Preventing Hearing Loss at Work) Code of Practice 2015'.",
    "The RMA's work supports the broader mission of the Department of Veterans' Affairs (DVA) in Australia.",
  ],
  editedQuoteBlock: `Veterans carry the burden of our freedom. We owe them not just thanks but action." - Ken Doolan`,
  editedTags: "Veteran Support, Repatriation Medical Authority, Australian Veterans, Health Policy, TPI Veterans",
  editedCta:
    "To further engage with the RMA's work, explore the latest Statements of Principles or participate in public consultations to contribute to the ongoing improvement of veterans' support systems.",
};

// dummyData.ts
export const currentDateFormatted = new Date().toLocaleDateString("en-AU", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// export const publishedArticles = [
//   {
//     id: "1",
//     title: "Supporting Our Veterans in 2025",
//     byline: "By John Doe",
//     lead_paragraph:
//       "This year we continue our commitment to Australia’s totally and permanently incapacitated veterans...",
//     content:
//       "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet...",
//     image_url: "https://via.placeholder.com/600x300.png?text=Article+1+Image",
//     key_facts: [
//       "Fact 1: Over 5,000 veterans supported",
//       "Fact 2: 50+ community programs initiated",
//     ],
//     quote_block: "Our veterans deserve the highest level of care and respect.",
//     tags: "Veteran Support",
//     created_at: "2025-08-19T10:00:00Z",
//     cta: "https://www.tpinews.com/article1",
//   },
//   {
//     id: "2",
//     title: "Upcoming Veteran Events",
//     byline: "By Jane Smith",
//     lead_paragraph: "Discover the latest events organized for veterans across Australia...",
//     content:
//       "Mauris eleifend est et turpis. Duis id erat. Suspendisse potenti. Aliquam erat volutpat...",
//     image_url: "https://via.placeholder.com/600x300.png?text=Article+2+Image",
//     key_facts: [
//       "Fact 1: 10 events planned this month",
//       "Fact 2: Online and offline participation options",
//     ],
//     quote_block: "Engaging our veterans strengthens the entire community.",
//     tags: "Events",
//     created_at: "2025-08-18T14:30:00Z",
//     cta: "https://www.tpinews.com/article2",
//   },
//   {
//     id: "3",
//     title: "Health and Wellbeing Resources",
//     byline: "By Alex Johnson",
//     lead_paragraph: "Access comprehensive health support tailored for veterans...",
//     content:
//       "Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus...",
//     image_url: "https://via.placeholder.com/600x300.png?text=Article+3+Image",
//     key_facts: [
//       "Fact 1: Mental health programs expanded",
//       "Fact 2: Free consultations available nationwide",
//     ],
//     quote_block: "Wellbeing is a priority for every veteran and their family.",
//     tags: "Health",
//     created_at: "2025-08-17T09:00:00Z",
//     cta: "https://www.tpinews.com/article3",
//   },
// ];

export const failedArticleIds: string[] = ["4"]; // Example failed load
export const error: string = ""; // Example error message


const Page = () => {
  const [error, setError] = useState<string | null>(null);
  const [publishedArticles, setPublishedArticles] = useState<any[]>([]);
  console.log(publishedArticles, "publishedArticles")
  const [failedArticleIds, setFailedArticleIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [articleIds, setArticleIds] = useState<string[]>(["737088b2-7953-4d5d-a63b-29ab46b763ed", "f756db76-f90f-406a-bcee-76a3d9915df7", "91f31651-59ed-4284-ae16-12846bebaafa"]);


  const clearError = () => setTimeout(() => setError(null), 5000);

  useEffect(() => {
    let isMounted = true;

    const formatKeyFacts = (keyFacts: string | string[] | undefined): string[] => {
      if (!keyFacts) return [];
      if (Array.isArray(keyFacts)) return keyFacts;
      return keyFacts.split("\n").map(f => f.trim()).filter(Boolean);
    };

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

        // Transform API response to match static publishedArticles
        const transformedArticles = articles
          .filter((article): article is any => !!article)
          .map((article) => ({
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
          }));

        if (isMounted) {
          setPublishedArticles(transformedArticles);
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

  return (
    <PDFViewer width="100%" height="900px">
      {/* <ArticlePDF {...pdfProps} /> */}
      <NewsletterPDF
        currentDateFormatted={currentDateFormatted}
        publishedArticles={publishedArticles}
        failedArticleIds={failedArticleIds}
      />
    </PDFViewer>
  );
};

export default Page;
