import {
	Button,
	Center,
	Container,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	Input,
	Text,
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useFormik } from "formik"
import { SignupForm, SignupFormType } from "@/utils/validators/UserForms"
import { toFormikValidationSchema } from "zod-formik-adapter"
import { useDebouncedCallback } from "use-debounce"
import { useAppDispatch, useAppSelector } from "@/utils/redux/hooks"
import { useRouter } from "next/router"
import { login } from "@/utils/redux/parts/user"
import useSWRMutation from "swr/mutation"

export default function SignUp() {
	const dispatch = useAppDispatch()
	const router = useRouter()
	const [error, setError] = useState<string | null>(null)
	const { trigger: sendVerify, data: verifyData } = useSWRMutation(
		"/api/user/verify",
		async (url, { arg }: { arg: string }) => {
			const qs = new URLSearchParams()
			qs.set("token", arg)
			const x = await fetch(`${url}?${qs}`, {
				method: "POST",
			})
			return await x.json()
		}
	)

	useEffect(() => {
		console.log(router.query)
		if (router.query.token) {
			sendVerify(router.query.token as string)
		}
	}, [])

	useEffect(() => {
		if (verifyData) {
			if (verifyData.status === "success") {
				dispatch(login(verifyData.data))
				setTimeout(() => {
					router.push("/")
				}, 2000)
			} else {
				setError(verifyData.message)
			}
		}
	}, [verifyData])

	if (verifyData && verifyData.status === "success") {
		return (
			<Container maxW="60ch">
				<Center flexDir="column">
					<Heading m={5}>Signup</Heading>
					<Text>
						Successful verification. You will be redirected to the
						homepage in a few seconds.
					</Text>
				</Center>
			</Container>
		)
	}

	return (
		<Container maxW="60ch">
			<Center flexDir="column">
				<Heading m={5}>Email Verification</Heading>
				<Text>{error && `Error: ${error}`}</Text>
			</Center>
		</Container>
	)
}
