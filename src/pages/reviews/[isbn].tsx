import path from 'path';
import fs from 'fs';
import { remark } from 'remark';
import html from 'remark-html';
import matter from 'gray-matter';
import { postsDirectory } from '@/consts';
import { GetStaticPropsContext } from 'next';
import { Heading, Text } from '@chakra-ui/react';

interface PostData {
	isbn: string;
	contentHtml: string;
	[key: string]: any
}

async function getPostData(isbn: string): Promise<PostData> {
	const fullPath = path.join(postsDirectory, `${isbn}.md`);
	const fileContents = fs.readFileSync(fullPath, 'utf8');

	// Use gray-matter to parse the post metadata section
	const matterResult = matter(fileContents);

	// Use remark to convert markdown into HTML string
	const processedContent = await remark()
		.use(html)
		.process(matterResult.content);
	const contentHtml = processedContent.toString();

	// Combine the data with the id and contentHtml
	return {
		isbn,
		contentHtml,
		...matterResult.data,
	};
}

export async function getStaticPaths() {
	const fileNames = fs.readdirSync(postsDirectory);
	const paths = fileNames.map((fileName) => {
		return {
			params: {
				isbn: fileName.replace(/\.md$/, ''),
			},
		};
	});

	return {
		paths,
		fallback: false,
	};
}

export async function getStaticProps({ params }: GetStaticPropsContext) {
	if (!params || !params.isbn || typeof params.isbn !== 'string') throw new Error('No isbn provided');
	const postData = await getPostData(params.isbn);

	return {
		props: {
			postData,
		},
	};
}

export default function Post({ postData }: { postData: PostData }) {
	return (
		<div>
			<Heading>{postData.title}</Heading>
			<Heading>{postData.subtitle}</Heading>
			<br />
			<Text>Author: {postData.author}</Text>
			<Text>Published: {postData.published}, {postData.publisher}</Text>
			<br />
			<div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
		</div>
	);
}
