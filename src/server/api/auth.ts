import { UserAuthLevel } from "@/utils/types"
import { TRPCError, initTRPC } from "@trpc/server"
import type { Context } from "./context"

export const t = initTRPC.context<Context>().create()

const isUserAuthed = t.middleware(({ next, ctx }) => {
	// if the user is not logged in or does not have the user auth level, throw an error
	if (!ctx.user || ctx.user.authLevel < UserAuthLevel.User) {
		throw new TRPCError({ code: "UNAUTHORIZED" })
	}
	return next({
		ctx: {
			user: ctx.user,
		},
	})
})
const isAdminAuthed = t.middleware(({ next, ctx }) => {
	// if the user is not logged in or does not have the user auth level, throw an error
	if (!ctx.user || ctx.user.authLevel < UserAuthLevel.Admin) {
		throw new TRPCError({ code: "UNAUTHORIZED" })
	}
	return next({
		ctx: {
			user: ctx.user,
		},
	})
})

export const userProtectedProcedure = t.procedure.use(isUserAuthed)
export const adminProtectedProcedure = t.procedure.use(isAdminAuthed)
