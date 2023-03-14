import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { NextFetchEvent, NextRequest } from "next/server"
import { appRouter } from "@/server/api/root"
import { createContext } from "@/server/api/context"

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
	})
}

export const config = {
	runtime: "edge",
	regions: ["fra1"],
}
