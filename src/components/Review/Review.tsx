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
import { EditIcon, DeleteIcon } from "@chakra-ui/icons"
import { Review, User } from "@prisma/client"
import StarRating from "@/components/StarRating"
import { useEffect, useRef, useState } from "react"
import useSWRMutation from "swr/mutation"

export default function ReviewComponent({
	review,
	author,
	editable = false,
	removeReview,
}: {
	review: Review
	author: Omit<User, "email" | "password">
	editable?: boolean
	removeReview: (reviewAuthorId: number) => void
}) {
	const toast = useToast()
	const [isLargerThan800] = useMediaQuery("(min-width: 800px)", {
		ssr: true,
		fallback: true, // return false on the server, and re-evaluate on the client side
	})
	const [deleteWindow, setDeleteWindow] = useState(false)
	const deleteCancelRef = useRef<HTMLButtonElement>(null)
	const {
		trigger: deleteReview,
		data: deleteReviewData,
		error: deleteReviewError,
	} = useSWRMutation(
		"/api/reviews",
		async (url, { arg }: { arg: string }) => {
			const qs = new URLSearchParams()
			qs.set("reviewAuthorId", review.reviewAuthorId.toString())
			return fetch(`${url}/${arg}?${qs.toString()}`, {
				method: "DELETE",
			}).then((res) => res.json())
		}
	)

	// remove the review from the page when it's deleted
	useEffect(() => {
		if (deleteReviewData) {
			if (deleteReviewData.status === "success") {
				toast({
					title: "Review deleted",
					status: "success",
					isClosable: true,
				})
				removeReview(review.reviewAuthorId)
			}
		}
	}, [deleteReviewData])

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
							Are you sure? You can't undo this action afterwards.
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
									deleteReview(review.isbn)
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
