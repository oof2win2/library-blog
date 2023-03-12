import { Container } from "@chakra-ui/react"
import ReviewRow from "@/components/BookRow"
import { NextPage } from "next"

const Home: NextPage = () => {
	return (
		<Container maxW="160ch">
			<ReviewRow length={20} />
		</Container>
	)
}

export default Home
