import {
	jwtDecrypt,
	JWTPayload,
	// decodeJwt,
	EncryptJWT,
} from 'jose'
import SECRET from '@/config/secrets'
import { mognoClient, databaseName, JWTDecryptOption } from '@/config/config'
import { codeOnlyOutput } from '@/config/alartmsg'

import {
	tokenGeneratorWithPsidObj,
	// tokenGeneratorWithTsidObj,
} from '@/types/apiData'

export async function accessTokenGenerator(
	payload: tokenGeneratorWithPsidObj,
	psid: string
) {
	return await new EncryptJWT({ ...payload, type: 'access_token' })
		.setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
		.setIssuedAt()
		.setIssuer(JWTDecryptOption.issuer)
		.setAudience(JWTDecryptOption.audience)
		.setExpirationTime('10s')
		.encrypt(SECRET.MIXED_TOKEN_KEY(psid))
}

export async function refreshTokenGenerator(
	payload: tokenGeneratorWithPsidObj,
	psid: string
) {
	return await new EncryptJWT({
		...payload,
		type: 'refresh_token',
	})
		.setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
		.setIssuedAt()
		.setIssuer(JWTDecryptOption.issuer)
		.setAudience(JWTDecryptOption.audience)
		.setExpirationTime('180s')
		.encrypt(SECRET.MIXED_TOKEN_KEY(psid))
}

export async function sessionTokenGenerator(
	token: string,
	psid: string,
	tsid: string
) {
	// token is 'access token', decrypted by 'psid'
	try {
		const { payload } = await jwtDecrypt(
			token,
			SECRET.MIXED_TOKEN_KEY(psid),
			JWTDecryptOption
		)

		if (payload.type !== 'access_token')
			throw 'sessionTokenGenerator:type is not access_token'

		return await new EncryptJWT({
			id: payload.id,
			type: 'session_token',
		})
			.setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
			.setIssuedAt()
			.setIssuer(JWTDecryptOption.issuer)
			.setAudience(JWTDecryptOption.audience)
			.setExpirationTime('300s')
			.encrypt(SECRET.MIXED_TOKEN_KEY(tsid))
	} catch (e) {
		throw e
	}
}

export async function robotTokenGenerator(payload: JWTPayload, tsid: string) {
	return await new EncryptJWT({
		...payload,
	})
		.setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
		.setIssuedAt()
		.setIssuer(JWTDecryptOption.issuer)
		.setAudience(JWTDecryptOption.audience)
		.setExpirationTime('300s')
		.encrypt(SECRET.MIXED_ROBOT_KEY(tsid))
}

export async function tokenChecker(
	token: string,
	psid: string,
	type?: 'at' | 'rt'
) {
	try {
		const { payload } = await jwtDecrypt(
			token,
			SECRET.MIXED_TOKEN_KEY(psid),
			JWTDecryptOption
		)

		console.log({ payload })
		// if (!payload.psid || payload.psid !== psid) return codeOnlyOutput(50040)
		// interacte with database
		await mognoClient.connect()
		const db = mognoClient.db(databaseName)
		const collection = db.collection('users')
		const user = await collection.findOne({ id: payload.id })
		// if didn't find user, throw error for now
		if (!user) return codeOnlyOutput(40106)
		if (payload.type === 'access_token' || type === 'at') {
			return {
				st: '',
				code: 200,
				name: user.username,
				icon: user.icon || 'http://localhost:3000/logo192.png',
			}
		} else if (payload.type === 'refresh_token' || type === 'rt') {
			// issue new access token
			const access_token = await accessTokenGenerator({ id: user.id }, psid)

			return {
				code: 201,
				at: access_token,
			}
		}
	} catch (e: any) {
		console.log(e.toString())
		// only error is about token expiration, then renew from refresh token if there is any
		if (e.code === 'ERR_JWT_EXPIRED' && type === 'at')
			return codeOnlyOutput(40402)
		// any other cases consider as illegal hacking!!!
		// possible security work can be done...
	}
	return codeOnlyOutput(50000)
}
