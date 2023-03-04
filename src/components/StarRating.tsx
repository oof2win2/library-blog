import { HStack } from "@chakra-ui/react"
import { IoStarOutline, IoStarHalf, IoStar } from "react-icons/io5"

export default function StarRating({ rating }: { rating: number }) {
	const stars = []
	for (let i = 0; i < 5; i++) {
		if (rating - i >= 1) {
			stars.push(<IoStar key={i} />)
		} else if (rating - i > 0) {
			stars.push(<IoStarHalf key={i} />)
		} else {
			stars.push(<IoStarOutline key={i} />)
		}
	}
	return <HStack>{stars}</HStack>
}
