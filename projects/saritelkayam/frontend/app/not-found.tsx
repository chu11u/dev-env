import type { Metadata } from "next";
import NotFoundContent from "./NotFoundContent";

export const metadata: Metadata = {
  title: "הדף לא נמצא | שרית אלקיים",
  description: "הדף שחיפשת לא ניתן למציאה.",
};

export default function NotFoundPage() {
  return <NotFoundContent />;
}
