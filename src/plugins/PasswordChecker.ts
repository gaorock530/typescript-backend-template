import { hashing } from '@/tools/password'
import { responseOutput } from '@/config/alartmsg'

const MAX_PASSWORD_TRY = 10
const ROT_PASSWORD_TRY = 3

class PasswordChecker {
	static _instance: PasswordChecker
	list: Record<string, number>
	interval: NodeJS.Timer | null

	constructor() {
		this.list = {}
		this.interval = null
		if (!PasswordChecker._instance) PasswordChecker._instance = this
		return PasswordChecker._instance
	}

	check(value: string, password: string, toCheck: string, secret?: string) {
		// console.log({
		// 	value,
		// 	time: this.list[value],
		// 	password,
		// 	toCheck,
		// 	hash: hashing(toCheck, secret),
		// })
		if (hashing(toCheck, secret) !== password) {
			if (!this.list[value]) this.list[value] = 1
			else this.list[value] = this.list[value] + 1
			if (this.list[value] && this.list[value] >= ROT_PASSWORD_TRY)
				return responseOutput(40205)
			if (this.list[value] && this.list[value] >= MAX_PASSWORD_TRY)
				return responseOutput(40400)
			return responseOutput(40203)
		}

		this.unlock(value)
		return true
	}

	unlock(value: string) {
		delete this.list[value]
	}
}

export default new PasswordChecker()
