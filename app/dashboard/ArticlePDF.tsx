 
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";

export interface ArticlePDFProps {
  editedTitle: string;
  editedByline: string;
  editedLeadParagraph: string;
  editedContent: string;
  editedKeyFacts: string[];
  editedQuoteBlock: string;
  editedTags: string;
  editedCta: string;
  currentArticle?: {
    image_url?: string;
    created_at?: string;
  };
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    padding: 30,
    fontSize: 12,
    color: "#333",
    lineHeight: 1.5,
  },
  container: {
    width: "100%",
  },
  image: {
    width: "100%",
    height: 180, // slightly taller hero image
    objectFit: "cover",
    marginBottom: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 12,
    lineHeight: 1.2,
  },
  byline: {
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "left",
    marginBottom: 15,
    color: "#555",
    lineHeight: 1.2,

  },
  lead: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 18,
    lineHeight: 1.3,
    textAlign: "left",
  },
  contentArea: {
    flexDirection: "row",
    gap: 20,
  },
  content: {
    flex: 2,
    textAlign: "justify",
    marginBottom: 20,
    lineHeight: 1.6,
    fontSize: 12,
    wordBreak: "normal",        // words cut nahi honge
    overflowWrap: "break-word", // long words line break karenge
  }
  ,
  sidebar: {
    flex: 1,
  },
  keyFacts: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    border: "1px solid #ccc",
  },
  keyFactsTitle: {
    fontWeight: "bold",
    fontSize: 12,
    paddingBottom: 5,
    marginBottom: 5,
    textAlign: "left",
  },
  listItem: {
    paddingVertical: 3,
    fontSize: 10,
    textAlign: "left",
  },
  quote: {
    backgroundColor: "#DBEAFE",
    marginVertical: 15,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#60A5FA",
  },
  quoteText: {
    fontStyle: "italic",
    fontSize: 11,
    textAlign: "left",
    color: "#000",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 12,
    marginTop: 20,
    fontSize: 9,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    flex: 1,
    paddingRight: 5,
    color: "#555",
  },
  cta: {
    marginTop: 20,
    fontSize: 11,
    textAlign: "left",
    color: "#007cba",
    textDecoration: "underline",
  },
});

const ArticlePDF: React.FC<ArticlePDFProps> = ({
  editedTitle,
  editedByline,
  editedLeadParagraph,
  editedContent,
  editedKeyFacts,
  editedQuoteBlock,
  editedTags,
  editedCta,
  currentArticle,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {currentArticle?.image_url && currentArticle.image_url.trim() !== "" && (
            <Image src={currentArticle.image_url} style={styles.image} />
          )}
          <Text style={styles.title}>{editedTitle}</Text>
          <Text style={styles.byline}>{editedByline}</Text>
          <Text style={styles.lead}>{editedLeadParagraph}</Text>

          <View style={styles.contentArea}>
            <Text style={styles.content}>{editedContent}</Text>

            <View style={styles.sidebar}>
              <View style={styles.keyFacts}>
                <Text style={styles.keyFactsTitle}>Key Facts</Text>
                {editedKeyFacts && editedKeyFacts?.map((fact, i) => (
                  <Text key={i} style={styles.listItem}>• {fact}</Text>
                ))}
              </View>

              {editedQuoteBlock && (
                <View
                  style={{
                    backgroundColor: "#DBEAFE",   // light blue background
                    padding: 10,                  // internal spacing
                    borderLeftWidth: 3,           // left accent border
                    borderLeftColor: "#007cba",   // blue border
                    borderRadius: 3,              // slightly rounded corners
                    marginVertical: 10,           // spacing around the quote
                  }}
                >
                  <Text style={{ fontStyle: "italic", fontSize: 11, color: "#000" }}>
                    <Text style={{ color: "#60A5FA" }}>"</Text>
                    {editedQuoteBlock}
                    <Text style={{ color: "#60A5FA" }}>"</Text>
                  </Text>
                </View>
              )}


            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Topic: {editedTags}</Text>
            <Text style={styles.footerText}>
              Date:{" "}
              {currentArticle?.created_at
                ? new Date(currentArticle.created_at).toLocaleDateString()
                : new Date().toLocaleDateString()}
            </Text>
            <Text style={styles.footerText}>Source: TPI News</Text>
          </View>

          {editedCta && (
            <View style={styles.cta}>
              <Link src={editedCta}>{editedCta}</Link>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default ArticlePDF;
