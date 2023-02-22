"use client";
import { Review } from "@prisma/client";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  SkeletonText,
  Skeleton,
  Center,
  Divider,
  Stack,
  StackDivider,
  Box,
} from "@chakra-ui/react";
import Image from "next/image";
export type Props = {
  review: Review | null;
  loading: boolean;
  error: string | null;
};
const ReviewPreview = ({ review, loading, error }: Props) => {
  console.log(review);
  if (error) {
    return (
      <Card maxW="96">
        <CardBody>
          <CardHeader>Something went wrong</CardHeader>
        </CardBody>
      </Card>
    );
  }
  return (
    <Card maxW="96" minW="96">
      <CardBody>
        <Stack divider={<StackDivider />} spacing="4">
          <Box>
            {loading ? <SkeletonText /> : <Text>{review?.title}</Text>}
            {loading ? <SkeletonText /> : <Text>{review?.authors}</Text>}
          </Box>
          <Center
            style={{
              // maxWidth: "50%",
              // maxHeight: "50%",
              position: "relative",
              minHeight: 300,
            }}
          >
            {loading ? (
              <Skeleton />
            ) : (
              <Image
                src={
                  review && review.largeThumbnail ? review.largeThumbnail : ""
                }
                alt={`Book cover`}
                fill
                style={{ objectFit: "contain" }}
              />
            )}
          </Center>
          {/* <CardFooter>ISBN {review?.isbn || "Unknown"}</CardFooter> */}
        </Stack>
      </CardBody>
    </Card>
  );
};
export default ReviewPreview;
