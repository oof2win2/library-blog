import { apiValidation, authAPI } from "@/middleware"
import { ApiRequest, SearchBookType, UserAuthLevel } from "@/utils/types"
import { NextApiResponse } from "next"
import nc from "next-connect"
import { db } from "@/utils/db"
import { PUT_ManageBooks_Body } from "./index.types"
import { meiliSearchClient } from "@/utils/meilisearch/admin"

const handler = nc<ApiRequest, NextApiResponse>()

// PUT /api/admins/manage-books
handler.put<ApiRequest>(
	apiValidation({ body: PUT_ManageBooks_Body }),
	authAPI(UserAuthLevel.Admin),
	async (req, res) => {
		const { isbn } = req.body as PUT_ManageBooks_Body
		const books = (await fetch(
			`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
		).then((x) => x.json())) as GoogleBooksAPIVolumeListResponse
		if (books.totalItems === 0) {
			res.status(404).json({
				status: "error",
				message: "No books found with that ISBN",
			})
			return
		}
		const book = books.items[0]
		const foundISBN = book.volumeInfo.industryIdentifiers.find(
			(x) => x.type === "ISBN_13"
		)?.identifier
		if (!foundISBN || foundISBN !== isbn) {
			res.status(404).json({
				status: "error",
				message: "No books found with that ISBN",
			})
			return
		}

		const existingBook = await db.book.findUnique({
			where: {
				isbn,
			},
		})
		if (existingBook) {
			res.status(409).json({
				status: "error",
				message: "A book with that ISBN already exists",
			})
			return
		}

		const dbBook = await db.book.create({
			data: {
				isbn,
				title: book.volumeInfo.title,
				subtitle: book.volumeInfo.subtitle || null,
				publisher: book.volumeInfo.publisher || null,
				publishedYear: book.volumeInfo.publishedDate
					? new Date(book.volumeInfo.publishedDate).getFullYear()
					: -1,
				authors: book.volumeInfo.authors?.join(";"),
				smallThumbnail:
					book.volumeInfo.imageLinks?.smallThumbnail || null,
				largeThumbnail: book.volumeInfo.imageLinks?.thumbnail || null,
			},
		})
		const index = meiliSearchClient.index("book")
		const document: SearchBookType = {
			isbn: dbBook.isbn,
			title: dbBook.title,
			subtitle: dbBook.subtitle,
			authors: dbBook.authors,
			smallThumbnail: dbBook.smallThumbnail,
			largeThumbnail: dbBook.largeThumbnail,
		}
		await index.addDocuments([document])
		res.status(200).json({
			status: "success",
			data: {
				book: dbBook,
			},
		})
	}
)

// DELETE /api/admins/manage-books
handler.delete<ApiRequest>(
	apiValidation({ body: PUT_ManageBooks_Body }),
	authAPI(UserAuthLevel.Admin),
	async (req, res) => {
		const { isbn } = req.body as PUT_ManageBooks_Body
		await db.review.deleteMany({
			where: {
				isbn,
			},
		})
		await db.book.delete({
			where: {
				isbn,
			},
		})
		const index = meiliSearchClient.index("book")
		await index.deleteDocument(isbn)
		res.status(200).json({
			status: "success",
			data: {
				isbn,
			},
		})
	}
)
export default handler
