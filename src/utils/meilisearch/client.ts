import { MeiliSearch } from "meilisearch"
const IS_PROD = process.env.NODE_ENV === "production"

/**
 * Ensure that there's only a single Prisma instance in dev. This is detailed here:
 * https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 */
declare global {
	// eslint-disable-next-line no-var
	var __globalMeili__: MeiliSearch
}

export let meiliSearchClient: MeiliSearch

if (IS_PROD) {
	meiliSearchClient = new MeiliSearch({
		host: process.env.NEXT_PUBLIC_MEILISEARCH_URL as string,
		apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY,
	})
} else {
	if (!global.__globalMeili__) {
		global.__globalMeili__ = new MeiliSearch({
			host: process.env.NEXT_PUBLIC_MEILISEARCH_URL as string,
			apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY,
		})
	}
	meiliSearchClient = global.__globalMeili__
}
