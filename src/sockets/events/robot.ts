import { encryptMessage, decryptMessage } from '@/tools/tools'
// import blocker from '@/plugins/blocker'
import log from '@/tools/console'
import { apiRobotResObj } from '@/types/apiData'
// import { databaseURL, databaseName } from '@/config/config'
import Store from '@/tools/robotStore'
import { responseOutput } from '@/config/alartmsg'
import blocker from '@/plugins/blocker'
// import { MongoClient, ServerApiVersion } from 'mongodb'

interface robotMessageObject {
	trace: []
	type?: string
	value?: string
}

interface robotVerifyObject {
	id: string
	type: string
	value: string
	code: string
}

export default function wsEvent(client: any) {
	const communication_key = client.id

	client.on(
		'robot',
		async (data: any, cb?: (buf: string | ArrayBuffer | Error) => void) => {
			log('robot', 'from:', client.psid)
			try {
				const msg: robotMessageObject = await decryptMessage(
					data,
					communication_key
				)
				if (!msg.type) throw responseOutput(40002)
				if (!msg.value) throw responseOutput(40001)
				console.log('issue hash...')

				const jwtHash = await Store.issue(
					client.psid,
					msg.type,
					msg.value,
					client.tsid
				)
				console.log({ jwtHash })
				if (typeof jwtHash !== 'string') throw responseOutput(40002)
				const responseObj: apiRobotResObj = {
					hash: String(jwtHash),
				}
				console.log('encrypt message...')
				const cbMsg = await encryptMessage(responseObj, communication_key)
				if (msg && cb) cb(cbMsg)
				console.log('message sent.')
			} catch (e: any) {
				console.log('error:', e)
				const error = await encryptMessage(e, communication_key)
				if (cb) cb(error)
			}
		}
	)

	client.on(
		'verifyCode',
		async (data: any, cb: (buf: string | ArrayBuffer | Error) => void) => {
			log('code-verify', 'from:', client.id)
			// error emit rate limit
			if (!blocker.check(client.psid)) {
				const cbMsg = await encryptMessage(
					responseOutput(40400),
					communication_key
				)
				if (cb) cb(cbMsg)
				return
			}
			try {
				const msg: robotVerifyObject = await decryptMessage(
					data,
					communication_key
				)
				console.log({ msg })
				if (!msg.value) throw responseOutput(40001)
				if (!msg.type) throw responseOutput(40002)
				if (!msg.code) throw responseOutput(30501)
				const res = await Store.check(
					client.psid,
					msg.code,
					msg.type,
					msg.value,
					client.tsid
				)
				console.log({ codeVerified: res })
				let resObj: Object
				if (res === true) {
					resObj = { code: 200 }
				} else {
					resObj = res
				}
				const cbMsg = await encryptMessage(resObj, communication_key)
				if (cb) cb(cbMsg)
			} catch (e: any) {
				console.log('error', e)
				const error = await encryptMessage(e, communication_key)
				if (cb) cb(error)
			}
		}
	)
}
