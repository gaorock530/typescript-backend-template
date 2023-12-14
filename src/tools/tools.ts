import CryptoJS, { AES, enc } from 'crypto-js'

export function parseDate(date: Date) {
	let target
	if (date instanceof Date) {
		target = date
	} else {
		target = new Date()
	}

	const year = target.getFullYear()
	const month = target.getMonth()
	const day = target.getDate()
	const hh = target.getHours()
	const mm = target.getMinutes()
	const ss = target.getSeconds()

	return {
		year,
		month,
		day,
		hh,
		mm,
		ss,
		time: ('0'.repeat(2) + hh).slice(-2) + ':' + ('0'.repeat(2) + mm).slice(-2),
		dateString: `${year}-${('0'.repeat(2) + month).slice(-2)}-${(
			'0'.repeat(2) + day
		).slice(-2)} ${('0'.repeat(2) + hh).slice(-2)}:${('0'.repeat(2) + mm).slice(
			-2
		)}:${('0'.repeat(2) + ss).slice(-2)}`,
	}
}

export function getMonthLength(timestamp: number) {
	let d = new Date(timestamp)
	// set to the next Month
	d.setMonth(d.getMonth() + 1)
	// set to the first day of next month
	d.setDate(1)
	// set one day less to get the last day in current month
	d.setDate(d.getDate() - 1)
	// then return the date
	return d.getDate()
}

export function getTimeStamp(
	year?: number,
	month?: number,
	day?: number,
	h?: number,
	m?: number
) {
	const customDate = new Date()
	if (year !== undefined) customDate.setFullYear(year)
	if (month !== undefined) customDate.setMonth(month)
	if (day !== undefined) customDate.setDate(day)
	if (h !== undefined) customDate.setHours(h)
	if (m !== undefined) customDate.setMinutes(m)
	customDate.setSeconds(0)
	return customDate.getTime()
}

export function ab2str(buf: Buffer) {
	return buf.toString('utf8')
}
export function str2ab(str: string) {
	const blob = new Blob([str])
	return blob.arrayBuffer()
}

// only used for websocket communication
export async function encryptMessage(json: object, key: string) {
	try {
		if (typeof json !== 'object') throw Error('json error')
		const btoaRes = AES.encrypt(JSON.stringify(json), key).toString()
		return await str2ab(btoaRes)
	} catch (e: any) {
		return Error(e.toString())
	}
}

export async function decryptMessage(message: string | Buffer, key: string) {
	try {
		let incoming = message
		if (incoming instanceof Buffer) {
			incoming = ab2str(incoming)
		}
		const bytes = AES.decrypt(incoming, key)
		const original = bytes.toString(enc.Utf8)
		return JSON.parse(original)
	} catch (e: any) {
		return Error(e.toString())
	}
}

//

export function decodeFingerPrint(fp: string, key: string) {
	try {
		const fpBytes = CryptoJS.AES.decrypt(fp, key)
		if (!fpBytes) throw Error('illegal finger print')
		const fpText = fpBytes.toString(CryptoJS.enc.Utf8)
		return JSON.parse(fpText)
	} catch (e: any) {
		console.log(e.toString())
		return {}
	}
}
