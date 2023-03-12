import { Box, Flex } from "@chakra-ui/react"
import { Book } from "@prisma/client"
import Link from "next/link"
import { useEffect, useState } from "react"
import BookPreview from "./BookPreview"
import { api } from "@/utils/api"

const ReviewRow = ({ length }: { length: number }) => {
	const bookReq = api.books.getCount.useQuery()
	const loading = bookReq.isLoading
	const books = bookReq.data ?? []

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
