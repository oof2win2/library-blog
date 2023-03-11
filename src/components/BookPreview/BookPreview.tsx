"use client"
import { Book } from "@prisma/client"
import {
	Card,
	CardHeader,
	CardBody,
	Text,
	SkeletonText,
	Skeleton,
	Center,
	Stack,
	StackDivider,
	Box,
} from "@chakra-ui/react"
import Image from "next/image"
export type Props = {
	book: Book | null
	loading: boolean
	error: string | null
}
const ReviewPreview = ({ book, loading, error }: Props) => {
	if (error) {
		return (
			<Card maxW="96">
				<CardBody>
					<CardHeader>Something went wrong</CardHeader>
				</CardBody>
			</Card>
		)
	}
	return (
		<Card maxW="96" minW="96">
			<CardBody>
				<Stack divider={<StackDivider />} spacing="4">
					<Box>
						{loading ? (
							<SkeletonText />
						) : (
							<Text>{book?.title}</Text>
						)}
						{loading ? (
							<SkeletonText />
						) : (
							<Text>{book?.authors}</Text>
						)}
					</Box>
					<Center
						style={{
							// maxWidth: "50%",
							// maxHeight: "50%",
							position: "relative",
							minHeight: 300,
						}}
					>
						{loading ? (
							<Skeleton />
						) : (
							<Image
								src={
									book && book.largeThumbnail
										? book.largeThumbnail
										: ""
								}
								alt={`Book cover`}
								fill
								style={{ objectFit: "contain" }}
							/>
						)}
					</Center>
					{/* <CardFooter>ISBN {review?.isbn || "Unknown"}</CardFooter> */}
				</Stack>
			</CardBody>
		</Card>
	)
}
export default ReviewPreview
