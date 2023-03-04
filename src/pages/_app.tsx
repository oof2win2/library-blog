import React from "react"
import Navbar from "@/components/Navbar/Navbar"
import { ChakraProvider } from "@chakra-ui/react"
import { AppProps } from "next/app"
import Head from "next/head"
import theme from "@/utils/chakraTheme"
import { Provider, useStore } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import { wrapper } from "@/utils/redux/store"

function MyApp({ Component, ...rest }: AppProps) {
	const { store, props } = wrapper.useWrappedStore(rest)
	return (
		<div>
			<Head>
				<meta
					name="viewport"
					content="initial-scale=1, width=device-width"
				/>
				<title>Bookaholic Blurbs</title>
			</Head>
			<Provider store={store}>
				{/* @ts-expect-error __PERSISTOR is not default so ts will complain otherwise */}
				<PersistGate persistor={store.__PERSISTOR}>
					<ChakraProvider theme={theme}>
						<Navbar />
						<Component {...props.pageProps} />
					</ChakraProvider>
				</PersistGate>
			</Provider>
		</div>
	)
}
export default MyApp
// export default wrapper.withRedux(MyApp);
