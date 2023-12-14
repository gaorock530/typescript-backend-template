import {
	encryptMessage,
	decryptMessage,
	// decodeFingerPrint,
} from '@/tools/tools'
import log from '@/tools/console'
import { apiLoginResObj, loginForm } from '@/types/apiData'
import { mognoClient, databaseName } from '@/config/config'
import { responseOutput } from '@/config/alartmsg'
import Store from '@/tools/robotStore'
import passwordChecker from '@/plugins/PasswordChecker'
import {
	accessTokenGenerator,
	refreshTokenGenerator,
	sessionTokenGenerator,
} from '@/tools/tokenHelper'

// User Login authentication via websocket tunnel

export default function wsEvent(client: any) {
	const fp = client.handshake.query.fp

	client.on(
		'login',
		async (data: any, cb?: (buf: string | ArrayBuffer | Error) => void) => {
			log('login', 'from:', client.id, { fp })
			try {
				// decrypt login message
				const msg: loginForm = await decryptMessage(data, client.id)
				// validate message
				console.log({ msg })
				if (!msg.value || !msg.password || !msg.type)
					throw responseOutput(30002)
				if (msg.secure) {
					if (!msg.hash) throw responseOutput(40105)
					Store.verify(client.psid, msg.hash, msg.value, client.tsid)
				}
				// interacte with database
				await mognoClient.connect()
				const db = mognoClient.db(databaseName)
				const collection = db.collection('users')
				const findPhone = await collection.findOne({ [msg.type]: msg.value })
				// if didn't find user, throw error for now
				// implement try blocker later
				if (!findPhone) throw responseOutput(40203)

				const checkRes = passwordChecker.check(
					msg.value,
					findPhone.password,
					msg.password
				)
				if (checkRes !== true) throw checkRes
				console.log('password check pass')

				const access_token = await accessTokenGenerator(
					{
						id: findPhone.id,
					},
					client.psid
				)

				const refresh_token = await refreshTokenGenerator(
					{
						id: findPhone.id,
					},
					client.psid
				)

				const session_token = await sessionTokenGenerator(
					access_token,
					client.psid,
					client.tsid
				)

				console.log({ access_token, refresh_token })

				// generate response object
				const responseObj: apiLoginResObj = {
					st: session_token,
					at: access_token,
					rt: refresh_token,
					username: findPhone.username,
					icon: 'http://localhost:3000/logo192.png',
					code: 200,
				}

				// encrypt response message
				const cbMsg = await encryptMessage(responseObj, client.id)
				if (cb) cb(cbMsg)
			} catch (e: any) {
				const error = await encryptMessage(e, client.id)
				console.log(e)
				if (cb) cb(error)
			}
		}
	)
}
