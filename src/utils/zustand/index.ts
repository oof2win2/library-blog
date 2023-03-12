import { User } from "@prisma/client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

type State = {
	user: User | null
}

type Actions = {
	login(user: User): void
	logout(): void
}

export const useUserStore = create(
	persist(
		immer<State & Actions>((set) => ({
			user: null,
			login: (user) => {
				set((state) => {
					state.user = user
				})
			},
			logout: () => {
				set((state) => {
					state.user = null
				})
			},
		})),
		{
			name: "nextData",
		}
	)
)
