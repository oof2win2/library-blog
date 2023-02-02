/// <reference path="../src/types.d.ts" />

import { PrismaClient } from "@prisma/client";
import fs from "fs/promises"
import {faker} from "@faker-js/faker"
import bcrypt from "bcryptjs"
import got from "got"

const config = {
	users: 10,
	posts: {
		minPerUser: 5,
		maxPerUser: 25,
	},
}

const prisma = new PrismaClient();
const run = async () => {
	await prisma.$connect()

	await prisma.post.deleteMany()
	await prisma.user.deleteMany()

	await fs.rm("./posts", {recursive: true, force: true})
	await fs.mkdir("./posts")

	// create users
	const userIDs: number[] = []
	for (let i = 0; i < config.users; i++) {
		const user = await prisma.user.create({
			data: {
				name: faker.name.firstName(),
				email: faker.internet.email(),
				password: bcrypt.hashSync(faker.internet.password())
			},
		})
		userIDs.push(user.id)
	}

	// fetch 100 books and create reviews for them
	const books: GoogleBooksAPIVolume[] = []
	for (let i = 0; i < 10; i++) {
		const response = await got.get(`https://www.googleapis.com/books/v1/volumes?q=quantum&startIndex=${40*i}&maxResults=40`).json<GoogleBooksAPIVolumeListResponse>()
		books.push(...response.items)
	}
	

	// create posts for each user
	for (const userID of userIDs) {
		const amountOfPosts = faker.datatype.number({
			min: config.posts.minPerUser,
			max: config.posts.maxPerUser,
		})

		const startIndex = faker.datatype.number({
			min: 0,
			max: books.length - amountOfPosts,
		})
		const booksToReview = books.slice(startIndex, startIndex+amountOfPosts)

		for (const book of booksToReview) {
			const isbn = book.volumeInfo.industryIdentifiers.find(x => x.type === "ISBN_13")?.identifier
			if (!isbn) continue
			const post = await prisma.post.create({
				data: {
					isbn: isbn,
					title: `"${book.volumeInfo.title?.replaceAll('"', "\"")}"`,
					postPublished: true,
					publishedYear: book.volumeInfo.publishedDate ? new Date(book.volumeInfo.publishedDate).getFullYear() : -1,
					publisher: `"${book.volumeInfo.publisher?.replaceAll('"', "\"")}"` || null,
					authors: `"${book.volumeInfo.authors?.join(";")?.replaceAll('"', "\"")}"`,
					postAuthorId: userID
				}
			})
			const postContent = `---\nisbn: ${isbn}\ntitle: ${post.title}\nauthor: ${post.authors}\npublished: ${post.publishedYear}\npublisher: ${post.publisher}\n---\n\n${faker.lorem.paragraphs().replaceAll("\n", "\n\n")}`
			await fs.writeFile(`./posts/${isbn}_${userID}.md`, postContent)
		}
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