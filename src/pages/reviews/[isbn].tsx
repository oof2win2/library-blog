import { GetServerSidePropsContext } from "next"
import {
	Container,
	Divider,
	Heading,
	StackItem,
	Text,
	Center,
	StackDivider,
	Stack,
	Box,
} from "@chakra-ui/react"
import { Book, Review, User } from "@prisma/client"
import NextImage from "next/image"
import { useEffect, useState } from "react"
import ReviewComponent from "@/components/Review/Review"
// import CreateReviewComponent from "@/components/Review/CreateReview"
import StarRating from "@/components/StarRating"
import { useUserStore } from "@/utils/zustand"
import { UserAuthLevel } from "@/utils/types"
import { useRouter } from "next/router"
import getSingleParam from "@/utils/getSingleParam"
import { api } from "@/utils/api"

export default function BookPage() {
	const user = useUserStore((store) => store.user)

	const router = useRouter()
	const isbn = getSingleParam(router.query, "isbn")
	const bookData = api.reviews.getBookReviewData.useQuery(isbn || "")
	const book = bookData.data
	// we need to ensure that if a user is logged in and they posted a review, that review is at the top of the list
	// so we sort the reviews by the reviewAuthorId, and if the user is logged in, we put the user's review at the top
	const reviews =
		bookData.data?.reviews.sort((a, b) => {
			if (user && user?.id === a.reviewAuthorId) return -1
			if (user && user?.id === b.reviewAuthorId) return -1
			return 1
		}) || []
	const authors = reviews.map((review) => review.reviewAuthor)

	if (bookData.isFetching)
		return (
			<Container maxW="80ch">
				<Heading>Loading...</Heading>
			</Container>
		)

	if (!book)
		return (
			<Container maxW="80ch">
				<Heading>Book not found</Heading>
			</Container>
		)

	const averageRating =
		reviews.reduce((acc, review) => {
			return acc + review.rating
		}, 0) / reviews.length

	const userHasReview = reviews.some(
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
				{/* {!userHasReview && (
					<StackItem>
						<CreateReviewComponent
							isbn={book.isbn}
							onSuccess={() => bookData.refetch()}
						/>
					</StackItem>
				)} */}
				{reviews.map((review) => {
					const author = review.reviewAuthor
					// the logged in user is the author of this review
					const editable =
						(user && user.authLevel >= UserAuthLevel.Admin) ||
						(user && author.id === user.id) ||
						false
					return (
						<StackItem key={review.reviewAuthorId}>
							<ReviewComponent
								review={review}
								author={author}
								editable={editable}
								onRemove={() => bookData.refetch()}
							/>
						</StackItem>
					)
				})}
			</Stack>
		</Container>
	)
}
