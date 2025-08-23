"use client";

import { Suspense } from "react";
import ArticlesPage from "./ArticlesPage";
 
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArticlesPage />
    </Suspense>
  );
}
