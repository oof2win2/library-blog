import { inferAsyncReturnType } from "@trpc/server"
import { getSessionData } from "../authHandlers"
import { prisma } from "@/server/db"
import { NextFetchEvent, NextRequest } from "next/server"
import { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies"

// custom context, available as .ctx on all requests
export async function createContext(req: NextRequest, ctx: NextFetchEvent) {
	const sessionData = await getSessionData(req.cookies)
	const user = sessionData?.user ?? null

	return {
		user,
		prisma,
		req,
		baseCtx: ctx,
		responseCookies: new ResponseCookies(new Headers()),
	}
}
export type Context = inferAsyncReturnType<typeof createContext>
