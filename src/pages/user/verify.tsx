import { Center, Container, Heading, Text, useToast } from "@chakra-ui/react"
import { useEffect } from "react"
import { useRouter } from "next/router"
import { api } from "@/utils/api"
import { useUserStore } from "@/utils/zustand"

export default function SignUp() {
	const toast = useToast()
	const router = useRouter()
	const login = useUserStore((store) => store.login)
	const verifyMutation = api.user.verify.useMutation()

	useEffect(() => {
		if (router.query.token) {
			verifyMutation.mutate(router.query.token as string)
		}
	}, [router.query.token])

	useEffect(() => {
		if (verifyMutation.status === "success") {
			setTimeout(() => {
				router.push("/")
			}, 2000)
			login(verifyMutation.data)
			toast({
				title: "Email verified",
				description: "You are now logged in",
				status: "success",
			})
		}
	}, [verifyMutation.status, verifyMutation.data])
	useEffect(() => {
		if (verifyMutation.status === "error") {
			toast({
				title: "Error",
				description: verifyMutation.error?.message,
				status: "error",
			})
		}
	}, [verifyMutation.status, verifyMutation.error])

	if (verifyMutation.status === "success") {
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
				<Text>Loading...</Text>
			</Center>
		</Container>
	)
}
