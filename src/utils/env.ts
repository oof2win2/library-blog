import { cleanEnv, str } from "envalid"

const ENV = cleanEnv(process.env, {
	JWT_SECRET: str({ desc: "JWT secret signing string" }),
	COOKIE_NAME: str({ desc: "Cookie name", default: "seq" }),
})
export default ENV
