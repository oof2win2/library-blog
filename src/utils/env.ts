import { cleanEnv, str } from "envalid"

const ENV = cleanEnv(process.env, {
	JWT_SECRET: str({ desc: "JWT secret signing string" }),
	COOKIE_NAME: str({ desc: "Cookie name", default: "seq" }),
	NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY: str({
		desc: "MeiliSearch search key",
	}),
	MEILISEARCH_ADMIN_KEY: str({ desc: "MeiliSearch admin key" }),
	NEXT_PUBLIC_MEILISEARCH_URL: str({ desc: "MeiliSearch URL" }),
})
export default ENV
