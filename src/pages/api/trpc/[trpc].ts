import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { NextFetchEvent, NextRequest } from "next/server"
import { appRouter } from "@/server/api/root"
import { createContext } from "@/server/api/context"
import { env } from "@/env.mjs"

// export API handler
export default async function handler(
	req: NextRequest,
	baseCtx: NextFetchEvent
) {
	return fetchRequestHandler({
		endpoint: "/api/trpc",
		router: appRouter,
		req,
		createContext: () => createContext(req, baseCtx),
		onError: ({ path, error }) => {
			if (error.code === "INTERNAL_SERVER_ERROR") {
				console.error(
					`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
				)
			}
		},
		responseMeta: ({ ctx }) => {
			// if there is no context, we don't do anything
			if (!ctx) return {}
			const cookie = ctx.responseCookies.get(env.COOKIE_NAME)
			if (!cookie) return {}
			return {
				headers: {
					"Set-Cookie": `${cookie.name}=${cookie.value};${
						cookie.httpOnly ? " HttpOnly" : ""
					};${cookie.secure ? " Secure" : ""};${
						cookie.sameSite ? ` SameSite=${cookie.sameSite}` : ""
					};${cookie.path ? ` Path=${cookie.path}` : ""};${
						cookie.domain ? ` Domain=${cookie.domain}` : ""
					};${
						cookie.expires
							? ` Expires=${cookie.expires.toUTCString()}`
							: ""
					}`,
				},
			}
		},
	})
}

export const config = {
	runtime: "edge",
	regions: ["fra1"],
}
