import * as trpc from "@trpc/server"
import { inferAsyncReturnType } from "@trpc/server"
import * as trpcNext from "@trpc/server/adapters/next"
import { getSessionData } from "../authHandlers"
import { prisma } from "@/server/db"

export async function createContext({
	req,
	res,
}: trpcNext.CreateNextContextOptions) {
	// Create your context based on the request object
	// Will be available as `ctx` in all your resolvers

	const sessionData = await getSessionData(req.cookies)
	const user = sessionData?.user ?? null

	return {
		user,
		prisma,
		req,
		res,
	}
}
export type Context = inferAsyncReturnType<typeof createContext>
