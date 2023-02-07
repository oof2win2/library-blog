"use client";
import { Center, Container } from "@chakra-ui/react";
import { Review } from "@prisma/client";
import { useEffect, useState } from "react";
import ReviewPreview from "./components/ReviewPreview/ReviewPreview";
import ReviewRow from "./components/ReviewRow/ReviewRow";

export default function Home() {
  return (
    <main>
      <Container maxW="160ch">
        <ReviewRow length={20} />
      </Container>
    </main>
  );
}
