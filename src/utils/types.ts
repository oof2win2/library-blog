import { User, Book } from "@prisma/client"

export enum UserAuthLevel {
	User,
	Admin,
}

export type SearchBookType = Pick<
	Book,
	| "isbn"
	| "authors"
	| "largeThumbnail"
	| "smallThumbnail"
	| "title"
	| "subtitle"
>
