import { Center, Container } from "@chakra-ui/react";
import ReviewRow from "../../components/ReviewRow/ReviewRow";

export default function Home() {
  return (
    <Container maxW="160ch">
      <ReviewRow length={20} />
    </Container>
  );
}
