"use client";

import { Suspense } from "react";
import PastNewsletters from "./PastNewsletters";
 
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PastNewsletters />
    </Suspense>
  );
}
