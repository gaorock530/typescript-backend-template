import CryptoJS from 'crypto-js'
import { PASSWORD_SECRET } from '@/config/config'

export function hashing(password: string, salt: string = PASSWORD_SECRET) {
	return CryptoJS.HmacMD5(password, salt).toString()
}
