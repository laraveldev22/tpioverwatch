"use client";
import { Suspense } from "react";
import NewsletterPublishs from "./NewsletterPublishs";
 
 
export default function NewsletterPublishPage() {
  return (
    <Suspense fallback={<div>Loading newsletter...</div>}>
      <NewsletterPublishs />
    </Suspense>
  );
}
