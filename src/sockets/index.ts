import http from 'http'
import log from '@/tools/console'
import eventRobot from '@/sockets/events/robot'
import eventLogin from '@/sockets/events/login'
import eventRegister from '@/sockets/events/register'
import eventUtility from '@/sockets/events/utilities'
import evertValidate from '@/sockets/events/validate'
// import { jwtVerify } from 'jose'
// import  {
// 	// AES,
// 	// MD5,
// } from 'crypto-js'
// import {
// 	tokenChecker,
// 	// refreshToken,
// 	// sessionTokenGenerator,
// } from '@/tools/tokenHelper'
import { detect } from 'detect-browser'
// import { mognoClient, databaseName, TOKEN_SECRET } from '@/config/config'
import { decodeFingerPrint } from '@/tools/tools'
import {
	whitelist,
	// SIGN_SECRET
} from '@/config/config'
// import { createClient } from 'redis'
// import CryptoJS from 'crypto-js'
// import { serialize, parse } from 'cookie'
import blocker from '@/plugins/blocker'

const corsOptions = {
	credentials: true,
	origin: function (origin: string, callback: any) {
		if (whitelist.indexOf(origin) !== -1) {
			callback(null, true)
		} else {
			// do something with invalid origin
			callback('Not allowed by CORS')
		}
	},
}

export default function WebSocket(
	server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) {
	const io = require('socket.io')(server, {
		cors: corsOptions,
		credentials: true,
		path: '/tunnel/',
	})

	log('Websocket', 'Ready')

	/**
	 * @description Client Connection Validation
	 * IN 'upgrade' stage, only validates client's legality (not worry about user authentication yet)
	 *
	 */

	server.on('upgrade', async (req, socket, head) => {
		console.log('--------------upgrade---------------')

		// this 'key' from client is 'tsid'
		const fp_key = req.headers['sec-websocket-protocol']
		const agent = req.headers['user-agent']
		console.log({ subprotocol: fp_key, agent })

		// validate all basic parameters required to upgrade
		try {
			// 1
			if (!fp_key || !agent)
				throw Error('illegal request, missing [protocol] or [agent]')
			// 2 check url
			const url = new URL(req.url as string, `http://${req.headers.host}`)
			const lg = url.searchParams.get('lg')
			const fp = url.searchParams.get('fp')
			if (!lg || !fp) throw 'wss uri error'

			// 2.1 validate lg
			const languageSupported = ['en', 'zh']
			if (!languageSupported.includes(lg)) throw 'language error'
			console.log({ lg })

			// 3. decode finger print info
			if (!fp) throw 'no finger print provided'
			const fpObject = decodeFingerPrint(fp, fp_key)
			if (
				!fpObject.device ||
				!fpObject.psid ||
				!fpObject.tsid ||
				!fpObject.ag ||
				!fpObject.ts
			) {
				throw 'fpObject error'
			}

			// 3.1 validate 'tsid'
			if (fpObject.tsid !== fp_key) throw 'psid error'

			// 4
			const browser = detect(agent)
			if (!browser) throw 'useragent error'

			// 5 validate finger print
			// 5.1 validate useragent
			if (agent !== fpObject.device.userAgent) throw 'useragent error'

			// 5.2 validate timestamp
			const clientDate = new Date(fpObject.ts)
			const localDate = new Date()
			const clientTimeZone = (clientDate.getTimezoneOffset() / 60) * -1
			console.log({ zone: clientTimeZone })
			const clientDelaySinceConnect = fpObject.ts - localDate.getTime()
			if (
				clientDelaySinceConnect >= 0 ||
				// checking client connection existance time not more than 7 days
				clientDelaySinceConnect > 1000 * 60 * 60 * 24 * 7
			)
				throw 'timezone error'
			console.log({ clientDelaySinceConnect })
		} catch (e: any) {
			console.log(e.toString())
			socket.write('401 Unauthorized')
			socket.end()
			console.log('end connection.')
			socket.destroy()
		}
	})

	// attach
	// io.use(async (socket: any, next: any) => {})

	// User Authentication (access token & refresh token)
	// io.use(async (socket: any, next: any) => {
	// 	const token = socket.handshake.auth.t
	// 	const fp_key = socket.request.headers['sec-websocket-protocol']
	// 	const fp = socket.handshake.query.fp
	// 	const communication_key = socket.id
	// 	if (!token || !fp_key || !fp) return next()

	// 	console.log('-------------Token Authentication--------------')

	// 	try {
	// 		const lg = socket.handshake.query.lg
	// 		if (!lg) throw 'lg error'
	// 		console.log({ protocol: fp_key, token, lg, fp })

	// 		// decode finger print
	// 		const fpObject = decodeFingerPrint(fp, fp_key)
	// 		console.log({ fpObject })

	// 		// validates tokens
	// 		if (token) {
	// 			const tokenCheckeRes = await tokenChecker(token, fpObject.psid)
	// 			// do something with auth.t (token)
	// 			console.log({ tokenCheckeRes })
	// 			// validates successful emit 'auth' event
	// 			const data = await encryptMessage(tokenCheckeRes, communication_key)
	// 			socket.emit('auth', data)
	// 		}
	// 	} catch (e: any) {
	// 		console.log(e.toString())
	// 		socket.disconnect(e.toString())
	// 	}

	// 	next()
	// })

	// Connection rate limit
	io.use(async (socket: any, next: any) => {
		// const ag = socket.handshake.query.ag
		const tsid = socket.handshake.headers['sec-websocket-protocol']
		const fp = socket.handshake.query.fp

		try {
			const { psid } = await decodeFingerPrint(fp, tsid)
			socket.psid = psid
			socket.tsid = tsid
			if (!blocker.check(psid)) {
				socket.disconnect()
				next(new Error(`Blocker for: ${psid} is ${blocker.timeToWait(psid)}`))
			}
		} catch (e) {
			next(new Error('invalid fp'))
		}

		console.log('----------[connection rate checking] PASS-----------')
		next()
	})

	io.on('connection', (client: any) => {
		console.log('----------socket connected--------')

		log('CLient connection', `[${client.id}] is connected.`)

		eventRobot(client)
		eventLogin(client)
		eventRegister(client)
		eventUtility(client)
		evertValidate(client)

		client.on('disconnect', () => {
			log('disconnect', `[${client.id}] is disconnected!`)
		})
	})
}
