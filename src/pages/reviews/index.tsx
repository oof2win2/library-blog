import { Center, Container } from "@chakra-ui/react"
import ReviewRow from "../../components/BookRow/BookRow"

export default function Home() {
	return (
		<Container maxW="160ch">
			<ReviewRow length={20} />
		</Container>
	)
}
