import { decryptMessage } from '@/tools/tools'
import log from '@/tools/console'

export default function wsEvent(client: any) {
	const key = client.handshake.headers['user-agent']
	const fp = client.handshake.query.fp
	const ag = client.handshake.query.ag
	// client.handshake.query.lg = '123'
	client.on('changeLanguage', async (data: any) => {
		log('change language', 'from:', client.id, { fp, ag })
		try {
			// decrypt login message
			const msg = await decryptMessage(data, key)
			console.log({ msg })
		} catch (e: any) {
			console.error(e.toString())
		}
	})
}
