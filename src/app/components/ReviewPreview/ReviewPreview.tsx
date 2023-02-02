"use client";
import { Review } from "@prisma/client";
import { Card, CardHeader, CardBody, CardFooter, Text } from "@chakra-ui/react";
export type Props = {
  review: Review | null;
  loading: boolean;
  error: string | null;
};
const ReviewPreview = ({ review, loading, error }: Props) => {
  return (
    <Card maxW="96">
      <CardBody>
        <Text>View a summary of all your customers over the last month.</Text>
        {/* <CardFooter>ISBN {review.isbn}</CardFooter> */}
      </CardBody>
    </Card>
  );
};
export default ReviewPreview;
