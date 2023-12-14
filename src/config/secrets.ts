// import { generateSecret } from 'jose'
import { SHA256 } from 'crypto-js'
import { v1 } from 'uuid'

class SecretFactory {
	static _instance: SecretFactory
	TOKEN_SECRET: string
	ROBOT_SECRET: string

	constructor() {
		this.TOKEN_SECRET = v1()
		this.ROBOT_SECRET = v1()

		if (!SecretFactory._instance) {
			SecretFactory._instance = this
		}
		return SecretFactory._instance
	}

	MIXED_TOKEN_KEY(key: string) {
		return new TextEncoder().encode(
			SHA256(this.TOKEN_SECRET + key)
				.toString()
				.slice(0, 32) // make sure output 256 bits
		)
	}

	MIXED_ROBOT_KEY(key: string) {
		return new TextEncoder().encode(
			SHA256(this.ROBOT_SECRET + key)
				.toString()
				.slice(0, 32) // make sure output 256 bits
		)
	}
}

export default new SecretFactory()
