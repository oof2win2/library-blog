import { Box, Flex, Grid, GridItem, HStack, Stack } from "@chakra-ui/react"
import { Book, Review } from "@prisma/client"
import Link from "next/link"
import { useEffect, useState } from "react"
import BookPreview from "../BookPreview/BookPreview"

const ReviewRow = ({ length }: { length: number }) => {
	const [books, setBooks] = useState<Book[]>()
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		setLoading(true)
		fetch(`/api/books?booksPerPage=${length}`)
			.then((res) => res.json())
			.then((res) => {
				setBooks(res.data.books)
				setLoading(false)
				setError(null)
			})
			.catch((err) => {
				setError(err.message)
				setLoading(false)
			})
	}, [])

	return (
		<Flex justify="center" wrap="wrap" gap="8px">
			{books?.map((book) => {
				return (
					<Box padding="4" key={book.isbn}>
						<Link href={`/reviews/${book.isbn}`}>
							<BookPreview
								book={book}
								loading={loading}
								error={null}
							/>
						</Link>
					</Box>
				)
			})}
		</Flex>
	)
}
export default ReviewRow
