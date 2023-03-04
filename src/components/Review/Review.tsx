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
} from "@chakra-ui/react"
import { EditIcon, DeleteIcon } from "@chakra-ui/icons"
import { Review, User } from "@prisma/client"
import StarRating from "@/components/StarRating"
import { useRef, useState } from "react"

export default function ReviewComponent({
	review,
	author,
	editable = false,
}: {
	review: Review
	author: Omit<User, "email" | "password">
	editable?: boolean
}) {
	const [isLargerThan800] = useMediaQuery("(min-width: 800px)", {
		ssr: true,
		fallback: true, // return false on the server, and re-evaluate on the client side
	})
	const [deleteWindow, setDeleteWindow] = useState(false)
	const deleteCancelRef = useRef<HTMLButtonElement>(null)
	const [editWindow, setEditWindow] = useState(false)

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
								// TODO: actual delete
								onClick={() => setDeleteWindow(false)}
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
							<Tooltip label="Edit review">
								<IconButton
									aria-label="Edit review"
									variant="ghost"
									onClick={() => setEditWindow(true)}
								>
									<EditIcon />
								</IconButton>
							</Tooltip>
						)}
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
				</Box>
			</Stack>
		</Card>
	)
}
