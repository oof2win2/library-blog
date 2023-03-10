import { GetServerSidePropsContext } from "next"
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
} from "@chakra-ui/react"
import { db } from "@/utils/db"
import { Book, Review, User } from "@prisma/client"
import NextImage from "next/image"
import { useEffect, useState } from "react"
import ReviewComponent from "@/components/Review/Review"
import CreateReviewComponent from "@/components/Review/CreateReview"
import StarRating from "@/components/StarRating"
import { useAppSelector } from "@/utils/redux/hooks"
import { UserAuthLevel } from "@/utils/types"

interface BookData {
	isbn: number
}

export async function getServerSideProps({
	params,
}: GetServerSidePropsContext) {
	if (
		!params ||
		!params.isbn ||
		typeof params.isbn !== "string" ||
		isNaN(parseInt(params.isbn))
	) {
		return {
			props: {
				postData: null,
			},
		}
	}

	const book = await db.book.findFirst({
		where: {
			isbn: params.isbn,
		},
	})
	if (!book)
		return {
			props: {
				book: null,
				reviews: [],
			},
		}
	const reviews = await db.review.findMany({
		where: {
			isbn: params.isbn,
		},
	})

	const authors = await db.user.findMany({
		where: {
			id: {
				in: [
					...new Set(reviews.map((review) => review.reviewAuthorId)),
				],
			},
		},
		include: {
			reviews: true,
		},
	})

	return {
		props: {
			book,
			reviews,
			authors,
		},
	}
}

export default function BookPage({
	book,
	reviews,
	authors,
}: {
	book: Book | null
	reviews: Review[]
	authors: Omit<User, "email" | "password">[]
}) {
	const { user } = useAppSelector((state) => state.user)
	const [finalReviews, setFinalReviews] = useState(reviews)
	const [finalAuthors, setFinalAuthors] = useState(authors)

	if (!book)
		return (
			<Container maxW="80ch">
				<Heading>Book not found</Heading>
			</Container>
		)
	const averageRating =
		finalReviews.reduce((acc, review) => {
			return acc + review.rating
		}, 0) / finalReviews.length

	const removeReview = (reviewAuthorId: number) => {
		setFinalReviews(
			finalReviews.filter((x) => x.reviewAuthorId !== reviewAuthorId)
		)
		setFinalAuthors(finalAuthors.filter((x) => x.id !== reviewAuthorId))
	}

	// we need to ensure that if a user is logged in and they posted a review, that review is at the top of the list
	// so we sort the reviews by the reviewAuthorId, and if the user is logged in, we put the user's review at the top
	useEffect(() => {
		setFinalReviews(
			finalReviews.sort((a, b) => {
				if (user && user?.id === a.reviewAuthorId) return -1
				if (user && user?.id === b.reviewAuthorId) return -1
				return 1
			})
		)
	}, [finalReviews])
	const userHasReview = finalReviews.some(
		(review) => user && user.id === review.reviewAuthorId
	)

	return (
		<Container maxW="80ch">
			<Stack
				divider={<StackDivider />}
				spacing="4"
				paddingBottom="4"
				direction={["column", "row"]}
			>
				<Center
					style={{
						position: "relative",
						minHeight: 300,
						minWidth: 200,
					}}
				>
					<NextImage
						src={
							book && book.largeThumbnail
								? book.largeThumbnail
								: ""
						}
						alt={`Book cover`}
						fill
						style={{ objectFit: "contain" }}
					/>
				</Center>
				<Box alignSelf="start">
					<Heading>{book.title}</Heading>
					<Heading>{book.subtitle}</Heading>

					<Text>Author: {book.authors}</Text>
					<Text>
						Published: {book.publishedYear}, {book.publisher}
					</Text>
					<Divider m={2} />
					<StarRating rating={averageRating} />
				</Box>
			</Stack>
			<Divider m={2} />
			<Stack spacing="4">
				{!userHasReview && (
					<StackItem>
						<CreateReviewComponent
							isbn={book.isbn}
							addReview={(review) => {
								setFinalReviews([review, ...finalReviews])
								setFinalAuthors([...finalAuthors, user!])
							}}
						/>
					</StackItem>
				)}
				{finalReviews.map((review) => {
					const author = finalAuthors.find(
						(author) => author?.id === review.reviewAuthorId
					)!
					// the logged in user is the author of this review
					const editable =
						(user && user.authLevel >= UserAuthLevel.Admin) ||
						(user && author?.id === user?.id) ||
						false
					return (
						<StackItem key={review.reviewAuthorId}>
							<ReviewComponent
								review={review}
								author={author}
								editable={editable}
								removeReview={removeReview}
							/>
						</StackItem>
					)
				})}
			</Stack>
		</Container>
	)
}
