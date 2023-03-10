import { Center, Container, Heading, Text } from "@chakra-ui/react"
import Error from "next/error"

export default function Page() {
	return (
		<Container maxW="80ch">
			<Heading>You don't have access to this page</Heading>
			<Text>Please try logging out and logging back in again.</Text>
			<Text>
				If that doesn't work, please contact the site administrator.
			</Text>
		</Container>
	)
}
