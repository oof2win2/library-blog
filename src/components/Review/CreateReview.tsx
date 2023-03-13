import { ReviewForm, ReviewFormType } from "@/utils/validators/ReviewForms"
import {
	HStack,
	Stack,
	useMediaQuery,
	Card,
	Textarea,
	IconButton,
	Button,
	Flex,
	Input,
	FormControl,
	FormLabel,
	FormErrorMessage,
	useToast,
} from "@chakra-ui/react"
import { useFormik } from "formik"
import { useEffect, useState } from "react"
import { toFormikValidationSchema } from "zod-formik-adapter"
import { IoStarOutline, IoStar } from "react-icons/io5"
import { useDebouncedCallback } from "use-debounce"
import { useUserStore } from "@/utils/zustand"
import { api } from "@/utils/api"
import { Review } from "@prisma/client"

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
	onSuccess: () => void
}

const CreateReview = ({ isbn, onSuccess }: CreateReviewParams) => {
	const toast = useToast()
	const [isLargerThan800] = useMediaQuery("(min-width: 800px)", {
		ssr: true,
		fallback: true, // return false on the server, and re-evaluate on the client side
	})
	const user = useUserStore((store) => store.user)
	const createReviewMutation = api.reviews.createReview.useMutation()

	const { setFieldValue, submitForm, errors } = useFormik<ReviewFormType>({
		initialValues: {
			reviewText: "",
			threeWords: "",
			rating: 5,
			isbn: isbn,
		},
		validationSchema: toFormikValidationSchema(ReviewForm),
		onSubmit: async (data) => {
			createReviewMutation.mutate({
				reviewText: data.reviewText,
				threeWords: data.threeWords,
				rating: data.rating,
				isbn: data.isbn,
			})
		},
	})

	useEffect(() => {
		if (createReviewMutation.status === "success") {
			onSuccess()
			toast({
				title: "Review created",
				description: "Your review has been created",
				status: "success",
			})
		}
	}, [createReviewMutation.status, createReviewMutation.data])
	useEffect(() => {
		if (createReviewMutation.status === "error") {
			toast({
				title: "Error creating review",
				description: createReviewMutation.error?.message,
				status: "error",
			})
		}
	}, [createReviewMutation.status, createReviewMutation.error])

	const debouncedSetFieldValue = useDebouncedCallback(
		(fieldName: string, fieldValue: string) => {
			setFieldValue(fieldName, fieldValue)
		},
		100
	)

	if (!user) return null

	return (
		<Card maxW="70ch" padding="4">
			<Stack spacing="4" direction="column">
				<FormControl
					isInvalid={Boolean(errors.reviewText)}
					isRequired
					variant="floating"
				>
					<FormLabel>Your review</FormLabel>
					<Textarea
						placeholder=""
						onChange={(e) =>
							debouncedSetFieldValue("reviewText", e.target.value)
						}
					/>
					<FormErrorMessage>{errors.reviewText}</FormErrorMessage>
				</FormControl>
				<FormControl
					isInvalid={Boolean(errors.threeWords)}
					isRequired
					variant="floating"
				>
					<FormLabel>Your three words to describe the book</FormLabel>
					<Input
						placeholder=""
						onChange={(e) =>
							debouncedSetFieldValue("threeWords", e.target.value)
						}
					/>
					<FormErrorMessage>{errors.threeWords}</FormErrorMessage>
				</FormControl>
				{/* the stars, but editable */}
				<Flex
					w="100%"
					justifyContent="space-between"
					flexDir={isLargerThan800 ? "row" : "column"}
				>
					<StarRating
						onChange={(value) => setFieldValue("rating", value)}
					/>
					<Button onClick={() => submitForm()}>Submit</Button>
				</Flex>
			</Stack>
		</Card>
	)
}
export default CreateReview
