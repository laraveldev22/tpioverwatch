"use client";
import { Suspense } from "react";
import ArticleView from "./ArticleView";
export default function NewsletterPublishPage() {
    return (
        <Suspense fallback={<div>Loading newsletter...</div>}>
            <ArticleView />
        </Suspense>
    );
}
