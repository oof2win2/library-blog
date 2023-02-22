import React from "react";
import Navbar from "@/components/Navbar/Navbar";
import { ChakraProvider } from "@chakra-ui/react";
import { AppProps } from "next/app";
// import Head from "next/head";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Navbar />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
