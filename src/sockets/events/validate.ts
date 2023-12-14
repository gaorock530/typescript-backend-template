import { decryptMessage, encryptMessage } from '@/tools/tools'
import { tokenChecker, sessionTokenGenerator } from '@/tools/tokenHelper'
import log from '@/tools/console'

export default function wsEvent(client: any) {
	const communication_key = client.id

	client.on('at_auth', async (data: any) => {
		log('at_auth', 'from:', client.id)
		let dateToSend
		try {
			const msg = await decryptMessage(data, communication_key)
			const res = await tokenChecker(msg.at, client.psid, 'at')
			if (res.code === 200) {
				const session_token = await sessionTokenGenerator(
					msg.at,
					client.psid,
					client.tsid
				)
				dateToSend = await encryptMessage(
					{ ...res, st: session_token },
					communication_key
				)
			} else {
				dateToSend = await encryptMessage(res, communication_key)
			}

			client.emit('auth', dateToSend)
		} catch (e: any) {
			console.error(e.toString())
			dateToSend = await encryptMessage(
				{ error: e.toString() },
				communication_key
			)
			client.emit('auth', dateToSend)
		}
	})

	client.on('rt_auth', async (data: any) => {
		log('rt_auth', 'from:', client.id)
		try {
			const msg = await decryptMessage(data, communication_key)
			const res = await tokenChecker(msg.rt, client.psid, 'rt')
			const dateToSend = await encryptMessage(res, communication_key)
			client.emit('auth', dateToSend)
		} catch (e: any) {
			console.error(e.toString())
			const dateToSend = await encryptMessage(
				{ error: e.toString() },
				communication_key
			)
			client.emit('auth', dateToSend)
		}
	})
}
