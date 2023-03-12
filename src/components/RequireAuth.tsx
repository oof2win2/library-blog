import { useAppSelector } from "@/utils/redux/hooks"
import { UserAuthLevel } from "@/utils/types"
import { Center, Container, Heading, Text } from "@chakra-ui/react"
import NextLink from "next/link"

export default function RequireAuth({
	authLevel,
	children,
}: {
	authLevel: UserAuthLevel
	children: React.ReactNode
}) {
	const { user } = useAppSelector((state) => state.user)
	if (!user)
		return (
			<Container maxW="80ch">
				<Center flexDir="column">
					<Heading>You must be logged in to view this page</Heading>
					<Text>
						You can log in{" "}
						<NextLink
							href="/user/login"
							style={{ textDecoration: "underline" }}
						>
							here
						</NextLink>
					</Text>
				</Center>
			</Container>
		)
	if (user.authLevel < authLevel)
		return (
			<Container maxW="80ch">
				<Center flexDir="column">
					<Heading>
						You do not have sufficient permissions to view this page
					</Heading>
					<Text>
						You can try logging in again{" "}
						<NextLink
							href="/user/login"
							style={{ textDecoration: "underline" }}
						>
							here
						</NextLink>
						, or contact an administrator if you believe this is an
						error
					</Text>
				</Center>
			</Container>
		)
	return <>{children}</>
}
