/// <reference path="../src/types.d.ts" />

import { PrismaClient } from "@prisma/client"
import fs from "fs/promises"
import { faker } from "@faker-js/faker"
import bcrypt from "bcryptjs"
import got from "got"

const config = {
	users: 15,
	reviews: {
		minPerUser: 15,
		maxPerUser: 25,
	},
}

const userPasswords = ["password", "qwertyuiop"]

const prisma = new PrismaClient()
const run = async () => {
	await prisma.$connect()

	await prisma.review.deleteMany()
	await prisma.user.deleteMany()
	await prisma.book.deleteMany()

	// create users
	const userIDs: number[] = []
	for (let i = 0; i < config.users; i++) {
		const user = await prisma.user.create({
			data: {
				name: faker.name.fullName(),
				email: faker.internet.email(),
				password: bcrypt.hashSync(
					userPasswords[i % userPasswords.length]
				),
			},
		})
		userIDs.push(user.id)
	}

	// fetch 100 books and create reviews for them
	const books: GoogleBooksAPIVolume[] = []
	for (let i = 0; i < 1; i++) {
		const response = await got
			.get(
				`https://www.googleapis.com/books/v1/volumes?q=quantum&startIndex=${
					40 * i
				}&maxResults=40`
			)
			.json<GoogleBooksAPIVolumeListResponse>()
		books.push(...response.items)
	}

	// create book objects for each book
	for (const book of books) {
		const isbn = book.volumeInfo.industryIdentifiers.find(
			(x) => x.type === "ISBN_13"
		)?.identifier
		if (!isbn) continue
		await prisma.book.create({
			data: {
				isbn: isbn,
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
	}

	// create posts for each user
	for (const userID of userIDs) {
		const amountOfPosts = faker.datatype.number({
			min: config.reviews.minPerUser,
			max: config.reviews.maxPerUser,
		})

		const startIndex = faker.datatype.number({
			min: 0,
			max: books.length - amountOfPosts,
		})
		const booksToReview = books.slice(
			startIndex,
			startIndex + amountOfPosts
		)

		let reviewsByUser = 0
		for (const book of booksToReview) {
			const isbn = book.volumeInfo.industryIdentifiers.find(
				(x) => x.type === "ISBN_13"
			)?.identifier
			if (!isbn) continue
			await prisma.review.create({
				data: {
					isbn: isbn,
					reviewPublished: true,
					reviewAuthorId: userID,
					reviewText: faker.lorem.paragraphs(),
					rating: faker.datatype.number({ min: 1, max: 5 }),
				},
			})
			reviewsByUser++
		}
		await prisma.user.update({
			where: { id: userID },
			data: {
				reviewAmount: reviewsByUser,
			},
		})
	}
}

run()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
