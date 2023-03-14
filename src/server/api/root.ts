import { createTRPCRouter } from "@/server/api/trpc"
import bookRouter from "@/server/api/routers/books"
import reviewRouter from "./routers/reviews"
import userRouter from "./routers/user"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	books: bookRouter,
	reviews: reviewRouter,
	user: userRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
