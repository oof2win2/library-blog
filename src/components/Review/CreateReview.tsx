import { useAppSelector } from "@/utils/redux/hooks"
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
	Card,
	Textarea,
	IconButton,
	Button,
	Flex,
	Input,
} from "@chakra-ui/react"
import { useState } from "react"

import { IoStarOutline, IoStarHalf, IoStar } from "react-icons/io5"

function StarRating({ onChange }: { onChange: (value: number) => void }) {
	const [rating, setRating] = useState(5)
	const stars = []
	const handleChange = (index: number) => {
		setRating(index + 1)
		onChange(index + 1)
	}
	for (let i = 0; i < 5; i++) {
		if (rating - i >= 1) {
			stars.push(
				<IconButton
					key={i}
					onClick={() => handleChange(i)}
					aria-label="Set rating"
					variant="ghost"
				>
					<IoStar />
				</IconButton>
			)
		} else {
			stars.push(
				<IconButton
					key={i}
					onClick={() => handleChange(i)}
					aria-label="Set rating"
					variant="ghost"
				>
					<IoStarOutline />
				</IconButton>
			)
		}
	}
	return <HStack>{stars}</HStack>
}

interface CreateReviewParams {
	isbn: string
}

const CreateReview = ({ isbn }: CreateReviewParams) => {
	const [isLargerThan800] = useMediaQuery("(min-width: 800px)", {
		ssr: true,
		fallback: true, // return false on the server, and re-evaluate on the client side
	})
	const { user } = useAppSelector((state) => state.user)

	if (!user) return null

	return (
		<Card maxW="70ch" padding="4">
			<Stack spacing="4" direction="column">
				<Textarea placeholder="Your review goes here" />
				<Input placeholder="Your three words go here" />
				{/* the stars, but editable */}
				<Flex
					w="100%"
					justifyContent="space-between"
					flexDir={isLargerThan800 ? "row" : "column"}
				>
					<StarRating onChange={(value) => console.log(value)} />
					<Button>Submit</Button>
				</Flex>
			</Stack>
		</Card>
	)
}
export default CreateReview
