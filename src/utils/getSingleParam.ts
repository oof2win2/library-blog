import { ParsedUrlQuery } from "querystring"

export default function getSingleParam(
	query: ParsedUrlQuery,
	paramName: string
): string | null {
	const param = query[paramName]
	if (!param) return null
	if (Array.isArray(param)) {
		return param[0] ?? null
	}
	return param
}
