"use client";
import { Suspense } from "react";
 import NewsletterView from "./NewsletterView";
export default function NewsletterPublishPage() {
    return (
        <Suspense fallback={<div>Loading newsletter...</div>}>
            <NewsletterView />
        </Suspense>
    );
}
