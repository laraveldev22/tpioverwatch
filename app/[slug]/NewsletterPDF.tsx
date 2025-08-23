
"use client";
import React from "react";
import {
    Page,
    Text,
    View,
    Image,
    StyleSheet,
    Link,
    Svg,
    Path,
} from "@react-pdf/renderer";

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
    page: {
        backgroundColor: "#F9FAFB",
        padding: 10,
    },
    header: {
        backgroundColor: "#171a39",
        color: "white",
        padding: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        borderRadius: 8, // 0.5rem
    },
    footerMain: {
        backgroundColor: "#171a39",
        color: "white",
        padding: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center", // so left content aligns nicely
        marginBottom: 20,
        borderRadius: 8, // 0.5rem
    },

    footerLeft: {
        flex: 1,
        color: "white",
        fontSize: 10,
        lineHeight: 1.4,
    },

    footerTitle: {
        fontWeight: "bold",
        fontSize: 12,
        marginBottom: 4,
    },

    footerRight: {
        alignItems: "flex-end",
    },

    date: {
        fontSize: 10,
        marginBottom: 4,
        color: "white",
    },

    logo: {
        width: 160,
        height: 60,
    },

    headerTitle: { fontSize: 16, fontWeight: "bold", color: "white" },
    section: {
        marginBottom: 16,
        borderBottom: "2px solid #E5E7EB", // Tailwind gray-200
    },
    heading: {
        fontSize: 18, // ~text-2xl
        fontWeight: "bold",
        marginBottom: 8,
        color: "#1F2937", // Tailwind gray-800
    },
    paragraph: {
        fontSize: 12, // ~text-lg
        lineHeight: 1.6,
        color: "#374151", // Tailwind gray-700
    },
    container: {
        width: "100%",
        marginBottom: 30,
    },
    image: {
        width: "100%",
        height: 180,
        objectFit: "cover",
        marginBottom: 15,
        borderRadius: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#111827",
    },
    byline: {
        fontSize: 11,
        fontStyle: "italic",
        marginBottom: 10,
        color: "#555",
    },
    lead: {
        fontSize: 13,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#1F2937",
    },
    contentArea: {
        flexDirection: "row",
        gap: 20,
    },
    content: {
        flex: 2,
        fontSize: 12,
        textAlign: "justify",
        marginBottom: 15,
        lineHeight: 1.5,
    },
    sidebar: {
        flex: 1,
    },
    keyFacts: {
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        border: "1px solid #ccc",
    },
    keyFactsTitle: {
        fontWeight: "bold",
        fontSize: 12,
        paddingBottom: 4,
        marginBottom: 6,
    },
    listItem: {
        fontSize: 10,
        marginBottom: 3,
    },
    quote: {
        backgroundColor: "#DBEAFE",
        padding: 10,
        borderLeftWidth: 3,
        borderLeftColor: "#2563EB",
        borderRadius: 4,
        marginBottom: 15,
    },
    quoteText: {
        fontStyle: "italic",
        fontSize: 11,
        color: "#1E3A8A",
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: "#ccc",
        paddingTop: 10,
        marginTop: 15,
        fontSize: 9,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    footerText: {
        flex: 1,
        fontSize: 9,
        color: "#555",
    },
    cta: {
        marginTop: 10,
        fontSize: 11,
        color: "#007cba",
        textDecoration: "underline",
    },
    icon: {
        marginRight: 8,
    },
    glanceSection: {
        marginBottom: 16,

    },
    text: {
        color: 'white',
        fontSize: 10,
        marginBottom: 4,
    },
    button: {
        backgroundColor: "#171a39", // deep blue
        width: "180px",
        color: "white",
        textAlign: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 6,
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
    },
    listItems: {
        fontSize: 12,
        color: "#111827", // Tailwind gray-900
        marginBottom: 6,
        lineHeight: 1.4,
    },
    bullet: {
        fontSize: 14,
        color: "#004682",
        marginRight: 6,
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderRadius: 8,
    },
    rowContauiner: {
        backgroundColor: "#EFF6FF", // deep blue
        padding: 10,

    },
    rows: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
    },
    logo2: {
        width: 150,
        height: 60,
    }

});

// ---------------- TYPES ----------------
interface Article {
    id: string;
    title: string;
    byline?: string;
    lead_paragraph?: string;
    content?: string;
    image_url?: string;
    key_facts?: string[];
    quote_block?: string;
    tags?: string;
    created_at?: string;
    cta?: string;
}

interface NewsletterPDFProps {
    currentDateFormatted: string;
    publishedArticles: Article[];
    failedArticleIds?: string[];
    error?: string;
    Logo: any,
    editableTitle: string,
    editableMessage: string
}

// ---------------- COMPONENT ----------------
const NewsletterPDF: React.FC<NewsletterPDFProps> = ({
    currentDateFormatted,
    publishedArticles,
    Logo,
    editableTitle,
    editableMessage
}) => (
    <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
            <Image src={Logo} style={styles.logo} />
            <Text style={styles.headerTitle}>{editableTitle}</Text>
            <Text style={styles.date}>{currentDateFormatted}</Text>
        </View>

        <View style={styles.section}>
            <Text style={styles.heading}>Editor&apos;s Message</Text>
            <Text style={styles.paragraph}>
                {editableMessage}
            </Text>
        </View>
        <View style={styles.glanceSection}>
            {/* Button-style heading */}
            <Text style={styles.button}>This Issue at a Glance</Text>


            <View style={styles.rowContauiner}>
                {/* List Items */}
                <View style={styles.row}>
                    <Svg
                        width={10}
                        height={10}
                        viewBox="0 0 8 8"
                        style={{ marginRight: 8, transform: "rotate(45deg)" }}
                    >
                        <Path
                            d="M1 4h5M4 1l3 3-3 3"
                            stroke="#132A36"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                    <Text style={styles.listItems}>
                        Understanding Article Demos: A Vital Tool for Journalism and Content Strategy
                    </Text>
                </View>

                <View style={styles.row}>
                    <Svg
                        width={10}
                        height={10}
                        viewBox="0 0 8 8"
                        style={{ marginRight: 8, transform: "rotate(45deg)" }}
                    >
                        <Path
                            d="M1 4h5M4 1l3 3-3 3"
                            stroke="#132A36"
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>
                    <Text style={styles.listItems}>
                        Understanding Article Demos: A Vital Tool for Journalism and Content Strategy
                    </Text>
                </View>

            </View>

        </View>


        {/* Loop through articles */}
        {publishedArticles?.map((article) => (
            <View key={article.id} style={styles.container}>
                {/* Hero image */}

                {article?.image_url && article.image_url.trim() !== "" && (
                    <Image src={article.image_url} style={styles.image} />
                )}

                {/* Title + Byline + Lead */}
                <Text style={styles.title}>{article.title}</Text>
                {article.byline && <Text style={styles.byline}>{article.byline}</Text>}
                {article.lead_paragraph && (
                    <Text style={styles.lead}>{article.lead_paragraph}</Text>
                )}

                {/* Content & Sidebar */}
                <View style={styles.contentArea}>
                    {article.content && (
                        <Text style={styles.content}>{article.content}</Text>
                    )}

                    <View style={styles.sidebar}>
                        {/* Key Facts */}
                        {article.key_facts && article.key_facts.length > 0 && (
                            <View style={styles.keyFacts}>
                                <Text style={styles.keyFactsTitle}>Key Facts</Text>
                                {article?.key_facts.map((fact, i) => (
                                    <Text key={i} style={styles.listItem}>
                                        • {fact}
                                    </Text>
                                ))}
                            </View>
                        )}

                        {/* Quote */}
                        {article.quote_block && (
                            <View style={styles.quote}>
                                <Text style={styles.quoteText}>"{article.quote_block}"</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Topic: {article.tags}</Text>
                    <Text style={styles.footerText}>
                        Date:{" "}
                        {article.created_at
                            ? new Date(article.created_at).toLocaleDateString()
                            : new Date().toLocaleDateString()}
                    </Text>
                    <Text style={styles.footerText}>Source: TPI News</Text>
                </View>

                {/* CTA */}
                {article.cta && (
                    <Link src={article.cta}>
                        <Text style={styles.cta}>{article.cta}</Text>
                    </Link>
                )}
            </View>
        ))}

        <View style={styles.footerMain}>
            {/* Left side - Support details */}
            <View style={styles.footerLeft}>
                <View style={styles.rows}>
                    <Svg width={12} height={12} viewBox="0 0 24 24" style={styles.icon}>
                        <Path
                            d="M12 2L2 7v5c0 5 5 10 10 10s10-5 10-10V7l-10-5z"
                            fill="white"
                        />
                    </Svg>
                    <Text style={styles.text}>Veteran Support Line</Text>
                </View>
                <View style={styles.rows}>
                    <Text style={styles.text}>National Veterans Helpline</Text>
                </View>
                <View style={styles.rows}>
                    <Text style={styles.text}>171 Richmond Rd, Richmond SA 5033</Text>
                </View>

                <View style={styles.rows}>
                    <Svg width={12} height={12} viewBox="0 0 24 24" style={styles.icon}>
                        <Path
                            d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.21c1.2.48 2.5.74 3.85.74a1 1 0 011 1v3.5a1 1 0 01-1 1C10.07 22 2 13.93 2 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.35.25 2.65.74 3.85a1 1 0 01-.21 1.11l-2.2 2.2z"
                            fill="white"
                        />
                    </Svg>
                    <Text style={styles.text}>Freecall: 1800 VET HELP (08 8351 8140)</Text>
                </View>

                <View style={styles.rows}>
                    <Svg width={12} height={12} viewBox="0 0 24 24" style={styles.icon}>
                        <Path
                            d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h5v2H8v-2z"
                            fill="white"
                        />
                    </Svg>
                    <Text style={styles.text}>Email: office@tpi-sa.com.au</Text>
                </View>
                <View style={styles.rows}>
                    <Svg width={12} height={12} viewBox="0 0 24 24" style={styles.icon}>
                        <Path
                            d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 18.93V20h-2v.93A8.001 8.001 0 014.07 13H5v-2H4.07A8.001 8.001 0 0111 3.07V4h2V3.07A8.001 8.001 0 0119.93 11H19v2h.93A8.001 8.001 0 0113 19.93z"
                            fill="white"
                        />
                    </Svg>
                    <Text style={styles.text}>Website: https://tpi-sa.com.au</Text>
                </View>

            </View>

            {/* Right side - Date + Logo */}
            <View style={styles.footerRight}>
                <Image src={Logo} style={styles.logo2} />
            </View>
        </View>
    </Page>
);

export default NewsletterPDF;