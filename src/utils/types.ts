import { User, Book } from "@prisma/client"
import { NextApiRequest } from "next"
import { SessionData } from "./validators"

export type ApiError = {
	statusCode: number
	message: string
	description: string
}

export type ApiResponse<D> =
	| {
			status: "success"
			data: D
	  }
	| {
			status: "error"
			errors: ApiError[]
	  }

type ApiRequestExtensions<Query, Body> = {
	populated: boolean
	query: Query
	body: Body
} & (
	| {
			populated: false
	  }
	| {
			populated: true
			sessionData: SessionData
			user: User
	  }
)
type DefaultRequestExtension = {
	Query: any
	Body: any
}
type RequestExtension = {
	Query: Partial<{
		[key: string]: string | string[]
	}>
	Body: any
}

export type ApiRequest<
	Params extends Partial<DefaultRequestExtension> = RequestExtension
> = NextApiRequest & ApiRequestExtensions<Params["Query"], Params["Body"]>

export type PopulatedApiRequest<
	Params extends Partial<DefaultRequestExtension> = RequestExtension
> = ApiRequest<Params> & {
	populated: true
}

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
