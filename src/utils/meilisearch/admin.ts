import { MeiliSearch } from "meilisearch"
import { env } from "@/env.mjs"
const IS_PROD = env.NODE_ENV === "production"

/**
 * Ensure that there's only a single Prisma instance in dev. This is detailed here:
 * https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 */
declare global {
	// eslint-disable-next-line no-var
	var __globalMeiliAdmin__: MeiliSearch
}

export let meiliSearchClient: MeiliSearch

if (IS_PROD) {
	meiliSearchClient = new MeiliSearch({
		host: env.NEXT_PUBLIC_MEILISEARCH_URL,
		apiKey: env.MEILISEARCH_ADMIN_KEY,
	})
} else {
	if (!global.__globalMeiliAdmin__) {
		global.__globalMeiliAdmin__ = new MeiliSearch({
			host: env.NEXT_PUBLIC_MEILISEARCH_URL,
			apiKey: env.MEILISEARCH_ADMIN_KEY,
		})
	}
	meiliSearchClient = global.__globalMeiliAdmin__
}
