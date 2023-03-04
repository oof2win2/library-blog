import {
	Box,
	Card,
	Stack,
	StackItem,
	Text,
	useMediaQuery,
} from "@chakra-ui/react"
import { Review, User } from "@prisma/client"
import StarRating from "@/components/StarRating"

export default function ReviewComponent({
	review,
	author,
}: {
	review: Review
	author: Omit<User, "email" | "password">
}) {
	const [isLargerThan800] = useMediaQuery("(min-width: 800px)", {
		ssr: true,
		fallback: true, // return false on the server, and re-evaluate on the client side
	})

	return (
		<Card maxW="70ch" padding="4">
			<Stack spacing="4" direction={isLargerThan800 ? "row" : "column"}>
				<StackItem alignSelf="start" minW="12ch" maxW="12ch">
					<Box>
						<Text>{author.name}</Text>
						<Text>{author.reviewAmount} reviews</Text>
						<StarRating rating={review.rating} />
					</Box>
				</StackItem>
				<Box>
					<Text>{review.reviewText}</Text>
				</Box>
			</Stack>
		</Card>
	)
}
