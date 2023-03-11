import { Box, Flex } from "@chakra-ui/react"
import { Book } from "@prisma/client"
import Link from "next/link"
import { useEffect, useState } from "react"
import BookPreview from "../BookPreview/BookPreview"

const ReviewRow = ({ length }: { length: number }) => {
	const [books, setBooks] = useState<Book[]>()
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		setLoading(true)
		fetch(`/api/books?booksPerPage=${length}`)
			.then((res) => res.json())
			.then((res) => {
				setBooks(res.data.books)
				setLoading(false)
			})
			.catch((err) => {
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
