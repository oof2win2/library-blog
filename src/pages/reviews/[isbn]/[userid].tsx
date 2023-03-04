import path from "path"
import fs from "fs/promises"
import { remark } from "remark"
import html from "remark-html"
import matter from "gray-matter"
import { postsDirectory } from "@/consts"
import { GetStaticPropsContext } from "next"
import { Container, Heading, Text } from "@chakra-ui/react"

interface PostData {
	isbn: number
	contentHtml: string
	[key: string]: any
}

async function getPostData(
	isbn: number,
	userId: number
): Promise<PostData | null> {
	const fullPath = path.join(postsDirectory, `${isbn}_${userId}.md`)
	try {
		const fileContents = await fs.readFile(fullPath, "utf8")

		// Use gray-matter to parse the post metadata section
		const matterResult = matter(fileContents)

		// Use remark to convert markdown into HTML string
		const processedContent = await remark()
			.use(html)
			.process(matterResult.content)
		const contentHtml = processedContent.toString()

		// Combine the data with the id and contentHtml
		return {
			isbn,
			contentHtml,
			...matterResult.data,
		}
	} catch {
		return null
	}
}

export async function getServerSideProps({ params }: GetStaticPropsContext) {
	if (
		!params ||
		!params.isbn ||
		typeof params.isbn !== "string" ||
		isNaN(parseInt(params.isbn))
	) {
		return {
			props: {
				postData: null,
			},
		}
	}
	if (
		!params ||
		!params.userid ||
		typeof params.userid !== "string" ||
		isNaN(parseInt(params.userid))
	) {
		return {
			props: {
				postData: null,
			},
		}
	}
	const postData = await getPostData(
		parseInt(params.isbn),
		parseInt(params.userid)
	)

	return {
		props: {
			postData,
		},
	}
}

export default function Post({ postData }: { postData: PostData | null }) {
	if (!postData) return <div>Post not found</div>
	return (
		<Container maxW="80ch">
			<Heading>{postData.title}</Heading>
			<Heading>{postData.subtitle}</Heading>
			<br />
			<Text>Author: {postData.author}</Text>
			<Text>
				Published: {postData.published}, {postData.publisher}
			</Text>
			<br />
			<div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
		</Container>
	)
}
