import { GetServerSidePropsContext } from "next";
import {
  Container,
  Divider,
  Heading,
  HStack,
  Skeleton,
  StackItem,
  Text,
  Center,
  StackDivider,
  Stack,
  Box,
  useMediaQuery,
} from "@chakra-ui/react";
import { db } from "@/utils/db";
import { Book, Review, User } from "@prisma/client";
import NextImage from "next/image";
import { useState } from "react";
import ReviewComponent from "@/components/Review/Review";
import StarRating from "@/components/StarRating";

interface BookData {
  isbn: number;
}

export async function getServerSideProps({
  params,
}: GetServerSidePropsContext) {
  if (
    !params ||
    !params.isbn ||
    typeof params.isbn !== "string" ||
    isNaN(parseInt(params.isbn))
  ) {
    return {
      props: {
        postData: null,
      },
    };
  }

  const book = await db.book.findFirst({
    where: {
      isbn: params.isbn,
    },
  });
  if (!book)
    return {
      props: {
        book: null,
        reviews: [],
      },
    };
  const reviews = await db.review.findMany({
    where: {
      isbn: params.isbn,
    },
  });

  const authors = await db.user.findMany({
    where: {
      id: {
        in: [...new Set(reviews.map((review) => review.reviewAuthorId))],
      },
    },
    include: {
      reviews: true,
    },
  });

  return {
    props: {
      book,
      reviews,
      authors,
    },
  };
}

export default function BookPage({
  book,
  reviews,
  authors,
}: {
  book: Book | null;
  reviews: Review[];
  authors: Omit<User, "email" | "password">[];
}) {
  if (!book)
    return (
      <Container maxW="80ch">
        <Heading>Book not found</Heading>
      </Container>
    );
  const averageRating =
    reviews.reduce((acc, review) => {
      return acc + review.rating;
    }, 0) / reviews.length;
  return (
    <Container maxW="80ch">
      <HStack divider={<StackDivider />} spacing="4" paddingBottom="4">
        <Center
          style={{
            position: "relative",
            minHeight: 300,
            minWidth: 200,
          }}
        >
          <NextImage
            src={book && book.largeThumbnail ? book.largeThumbnail : ""}
            alt={`Book cover`}
            fill
            style={{ objectFit: "contain" }}
          />
        </Center>
        <Box alignSelf="start">
          <Heading>{book.title}</Heading>
          <Heading>{book.subtitle}</Heading>

          <Text>Author: {book.authors}</Text>
          <Text>
            Published: {book.publishedYear}, {book.publisher}
          </Text>
          <Divider />
          <StarRating rating={averageRating} />
        </Box>
      </HStack>
      <Divider />
      <Stack spacing="4">
        {reviews.map((review) => {
          const author = authors.find(
            (author) => author.id === review.reviewAuthorId
          )!;
          return (
            <StackItem key={author.id}>
              <ReviewComponent review={review} author={author} />
            </StackItem>
          );
        })}
      </Stack>
    </Container>
  );
}
