import { Container, Heading, Text } from "@chakra-ui/react"

export default function Page() {
	return (
		<Container maxW="80ch">
			<Heading>You don&apos;t have access to this page</Heading>
			<Text>Please try logging out and logging back in again.</Text>
			<Text>
				If that doesn&apos;t work, please contact the site
				administrator.
			</Text>
		</Container>
	)
}
