// import jwt from 'jsonwebtoken'
import { jwtDecrypt } from 'jose'
import { robotTokenGenerator } from './tokenHelper'
import { responseOutput } from '@/config/alartmsg'
import SECRET from '@/config/secrets'
import { JWTDecryptOption } from '@/config/config'

class RobotStore {
	static _instance: RobotStore
	record: Record<string, Map<string, { hash: string; code: string }>>

	constructor() {
		this.record = {}
		if (!RobotStore._instance) RobotStore._instance = this
		return RobotStore._instance
	}

	// id: psid, secret: tsid
	async issue(id: string, type: string, value: string, secret: string) {
		const hash = await robotTokenGenerator({ id, type, value }, secret)

		const num = Math.random() * 10000000
		const code = num.toString().slice(0, 6)

		try {
			const res = await this.setKey(id, value, { hash, code }, secret)
			console.log({ code })
			return res.hash
		} catch (e: any) {
			console.log('issue:', e)
			throw e
		}
	}

	async setKey(
		id: string,
		value: string,
		obj: { hash: string; code: string },
		secret: string
	) {
		// get rid of any keys that expired
		this.flush(id, secret)
		if (!this.record[id]) this.record[id] = new Map()
		// option 1. - check if already issued a hash for the 'value'
		// if (this.record[key].has(value)) throw responseOutput(30401)
		// option 2. - if already issued a hash for the value, check timestamp
		if (this.record[id].has(value)) {
			const checkObj = this.record[id].get(value) || { hash: '' }
			try {
				const { payload } = await jwtDecrypt(
					checkObj.hash,
					SECRET.MIXED_ROBOT_KEY(secret),
					JWTDecryptOption
				)
				if (!payload.iat) throw responseOutput(50040)
				const diff = Date.now() - payload.iat
				// if requset period is shorter than 10 seconds, error
				if (diff <= 10000) throw responseOutput(40401)
				// else delete old hash, ready for renew
				else this.record[id].delete(value)
			} catch (e) {
				console.log('setkey:', e)
				throw e
			}
		}
		// check if hash issued exceeds store limit
		if (this.record[id].size > 3) throw responseOutput(30400)
		console.log('setting record...')
		this.record[id].set(value, obj)
		console.log(id, 'length is', this.record[id].size)
		return obj
	}

	getKey(key: string) {
		if (!this.record) return false
		if (this.record[key]) return this.record[key]
		return false
	}

	delKey(key: string) {
		delete this.record[key]
	}

	async check(
		key: string,
		codeToCheck: string,
		type: string,
		value: string,
		secret: string
	) {
		// get rid of any keys that expired
		// this.flush(key, secret)
		if (!this.record[key]) throw responseOutput(40301)
		const valueToCheck = this.record[key].get(value)
		if (!valueToCheck) throw responseOutput(40005)
		if (!valueToCheck.hash || !valueToCheck.code) throw responseOutput(40005)
		if (codeToCheck !== valueToCheck.code) throw responseOutput(40101)

		try {
			const { payload } = await jwtDecrypt(
				valueToCheck.hash,
				SECRET.MIXED_ROBOT_KEY(secret),
				JWTDecryptOption
			)
			console.log({ payload })
			if (
				typeof payload !== 'string' &&
				(!payload.type || payload.type !== type)
			)
				return responseOutput(40002)
			if (
				typeof payload !== 'string' &&
				(!payload.value || payload.value !== value)
			)
				return responseOutput(40001)
			return true
		} catch (e: any) {
			console.log(e.toString())
			return responseOutput(40102)
		}
	}

	verify(key: string, hash: string, value: string, secret: string) {
		this.flush(key, secret)
		if (!this.record[key]) throw responseOutput(40301)
		const store = this.record[key].get(value)
		if (!store) throw responseOutput(40301)
		if (hash !== store.hash) throw responseOutput(40105)
		return true
	}

	flush(key: string, secret: string) {
		if (!this.record[key]) return
		this.record[key].forEach(async (entry, entryKey) => {
			try {
				await jwtDecrypt(
					entry.hash,
					SECRET.MIXED_ROBOT_KEY(secret),
					JWTDecryptOption
				)
			} catch (e) {
				this.record[key].delete(entryKey)
			}
		})

		if (this.record[key].size === 0) {
			delete this.record[key]
		}
	}

	get status() {
		return this.record
	}
}

export default new RobotStore()
