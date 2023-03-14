import { Center, Container, Heading, Text } from "@chakra-ui/react"
import { useEffect } from "react"
import { useRouter } from "next/router"
import { useUserStore } from "@/utils/zustand"
import { api } from "@/utils/api"

export default function SignIn() {
	const { user, logout } = useUserStore()
	const router = useRouter()
	const logoutMutation = api.user.logout.useMutation()

	useEffect(() => {
		logoutMutation.mutate()
	}, [])
	useEffect(() => {
		if (logoutMutation.status === "success") {
			logout()
		}
	}, [logoutMutation.status, logoutMutation.isLoading])
	useEffect(() => {
		if (!user) setTimeout(() => router.push("/"), 2000)
	}, [user])

	if (user) {
		return (
			<Container maxW="60ch">
				<Center flexDir="column">
					<Heading m={5}>Logout</Heading>
					<Text>You will be logged out soon</Text>
				</Center>
			</Container>
		)
	}

	return (
		<Container maxW="60ch">
			<Center flexDir="column">
				<Heading m={5}>Logout</Heading>
				<Text>You have been logged out</Text>
				<Text>You will be redirected to the homepage soon</Text>
			</Center>
		</Container>
	)
}
