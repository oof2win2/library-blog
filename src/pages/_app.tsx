import { type AppType } from "next/app"
import { api } from "@/utils/api"
import { ChakraProvider } from "@chakra-ui/react"
import Navbar from "@/components/Navbar"
import Head from "next/head"

const MyApp: AppType = ({ Component, pageProps }) => {
	return (
		<ChakraProvider>
			<Head>
				<meta
					name="viewport"
					content="initial-scale=1, width=device-width"
				/>
				<title>Bookaholic Blurbs</title>
			</Head>
			<Navbar />
			<Component {...pageProps} />
		</ChakraProvider>
	)
}

export default api.withTRPC(MyApp)
