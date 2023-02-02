"use client";
import { Center } from "@chakra-ui/react";
import { Review } from "@prisma/client";
import { useEffect, useState } from "react";
import ReviewPreview from "./components/ReviewPreview/ReviewPreview";

export default function Home() {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/reviews/9780060963101/62")
      .then((res) => res.json())
      .then((data) => {
        setReview(data.review);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  });

  return (
    <main>
      <Center>
        <ReviewPreview review={review} error={error} loading={loading} />
      </Center>
    </main>
  );
}
