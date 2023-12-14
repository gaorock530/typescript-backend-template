import { encryptMessage, decryptMessage } from '@/tools/tools'
import log from '@/tools/console'
import { userRegisterObj } from '@/types/apiData'
import { databaseURL, databaseName } from '@/config/config'
import { MongoClient, ServerApiVersion } from 'mongodb'
import { responseOutput } from '@/config/alartmsg'
import Store from '@/tools/robotStore'
import { hashing } from '@/tools/password'
import { v4 as uuidv4 } from 'uuid'

export default function wsEvent(client: any) {
	const communication_key = client.id
	client.on(
		'register',
		async (data: any, cb?: (buf: string | ArrayBuffer | Error) => void) => {
			log('register', 'from:', client.id)
			// const mognoClient = new MongoClient(databaseURL.development)
			const mognoClient = new MongoClient(databaseURL.development, {
				serverApi: {
					version: ServerApiVersion.v1,
					strict: true,
					deprecationErrors: true,
				},
			})
			try {
				// decrypt login message
				const msg = await decryptMessage(data, communication_key)
				console.log(databaseURL.development)
				// validate message
				if (!msg.type || msg.type !== 'phone') throw responseOutput(40002)
				if (!msg.value) throw responseOutput(40001)
				if (!msg.username) throw responseOutput(40201)
				if (!msg.password) throw responseOutput(40202)
				// ...
				// interacte with database
				// ...
				// generate response object
				console.log('register msg:', msg)

				await mognoClient.connect()
				const db = mognoClient.db(databaseName)
				const collection = db.collection('users')

				// check unique key of 'phone' & 'username'
				const findPhone = await collection.findOne({ [msg.type]: msg.value })
				if (findPhone) throw responseOutput(30101)
				const findUser = await collection.findOne({ username: msg.username })
				if (findUser) throw responseOutput(30102)

				const user: userRegisterObj = {
					id: uuidv4(),
					username: msg.username,
					password: hashing(msg.password),
					[msg.type]: msg.value,
				}
				await collection.insertOne(user)
				const responseObj = responseOutput(10010)
				// encrypt response message
				const cbMsg = await encryptMessage(responseObj, communication_key)
				// delete robot hashes from store when register successfully
				Store.delKey(msg.value)
				if (cb) cb(cbMsg)
			} catch (err: any) {
				console.log({ e: err })
				const cbError = await encryptMessage(err, communication_key)
				if (cb) cb(cbError)
			} finally {
				mognoClient.close()
			}
		}
	)
}

// 9pRBBlsbwuB09Zmt
