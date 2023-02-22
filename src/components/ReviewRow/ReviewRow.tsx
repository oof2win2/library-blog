import { Box, Flex, Grid, GridItem, HStack, Stack } from "@chakra-ui/react";
import { Review } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReviewPreview from "../ReviewPreview/ReviewPreview";

const ReviewRow = ({ length }: { length: number }) => {
  const [reviews, setReviews] = useState<Review[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reviews?reviewsPerPage=${length}`)
      .then((res) => res.json())
      .then((res) => {
        setReviews(res.data.reviews);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <Flex justify="center" wrap="wrap" gap="8px">
      {reviews?.map((review, index) => {
        return (
          <Box padding="4">
            <Link href={`/reviews/${review.isbn}/${review.reviewAuthorId}`}>
              <ReviewPreview review={review} loading={loading} error={null} />
            </Link>
          </Box>
        );
      })}
    </Flex>
  );
};
export default ReviewRow;
