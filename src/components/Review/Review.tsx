import {
	AlertDialog,
	AlertDialogOverlay,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogBody,
	AlertDialogFooter,
	Button,
	Box,
	Card,
	IconButton,
	Stack,
	StackItem,
	Text,
	Tooltip,
	useMediaQuery,
	Divider,
	useToast,
} from "@chakra-ui/react"
import { DeleteIcon } from "@chakra-ui/icons"
import { Review, User } from "@prisma/client"
import StarRating from "@/components/StarRating"
import { useEffect, useRef, useState } from "react"
import { api } from "@/utils/api"

export default function ReviewComponent({
	review,
	author,
	editable = false,
	onRemove,
}: {
	review: Review
	author: Omit<User, "email" | "password">
	editable?: boolean
	onRemove: () => void
}) {
	const toast = useToast()
	const [isLargerThan800] = useMediaQuery("(min-width: 800px)", {
		ssr: true,
		fallback: true, // return false on the server, and re-evaluate on the client side
	})
	const [deleteWindow, setDeleteWindow] = useState(false)
	const deleteCancelRef = useRef<HTMLButtonElement>(null)
	const removeReview = api.reviews.deleteReview.useMutation()

	// remove the review from the page when it's deleted
	useEffect(() => {
		if (removeReview.status === "success") {
			toast({
				title: "Review deleted",
				status: "success",
				isClosable: true,
			})
			onRemove()
		}
	}, [removeReview.status])

	return (
		<Card maxW="70ch" padding="4">
			{/* delete dialog */}
			<AlertDialog
				isOpen={deleteWindow}
				leastDestructiveRef={deleteCancelRef}
				onClose={() => setDeleteWindow(false)}
			>
				<AlertDialogOverlay>
					<AlertDialogContent>
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Delete Review
						</AlertDialogHeader>

						<AlertDialogBody>
							Are you sure? You can&apos;t undo this action
							afterwards.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button
								ref={deleteCancelRef}
								onClick={() => setDeleteWindow(false)}
							>
								Cancel
							</Button>
							<Button
								colorScheme="red"
								onClick={() => {
									setDeleteWindow(false)
									removeReview.mutate({
										isbn: review.isbn,
									})
								}}
								ml={3}
							>
								Delete
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>

			<Stack spacing="4" direction={isLargerThan800 ? "row" : "column"}>
				<StackItem alignSelf="start" minW="12ch" maxW="12ch">
					<Box>
						<Text>{author.name}</Text>
						<Text>{author.reviewAmount} reviews</Text>
						<StarRating rating={review.rating} />
						{editable && (
							<Tooltip label="Delete review">
								<IconButton
									aria-label="Delete review"
									variant="ghost"
									onClick={() => setDeleteWindow(true)}
								>
									<DeleteIcon />
								</IconButton>
							</Tooltip>
						)}
					</Box>
				</StackItem>
				<Box>
					<Text>{review.reviewText}</Text>
					<Divider m={2} />
					<Text>Three words: {review.threeWords}</Text>
				</Box>
			</Stack>
		</Card>
	)
}
