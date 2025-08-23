"use client";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
export function TopLoader() {
  return <>
    <Toaster position="bottom-right" reverseOrder={false} />
    <NextTopLoader />
  </>;
}
