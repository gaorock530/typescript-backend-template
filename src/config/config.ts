import { MongoClient, ServerApiVersion } from 'mongodb'
import { generateSecret } from 'jose'
import { v1 as uuidv1 } from 'uuid'

export const databaseURL = {
	development:
		'mongodb+srv://magic-admin:enfRLFml4NcUO5Sm@cluster0.jr17jsp.mongodb.net/?retryWrites=true&w=majority',
	// development:
	// 	'mongodb+srv://gaorock530:ePp7swWdyfhlM18e@hdlovers-database.aoquhmc.mongodb.net/?retryWrites=true&w=majority',
	production: '',
}

export const databaseName = 'exerciseData'

export const mognoClient = new MongoClient(databaseURL.development, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
})

const ISSUER_ID = uuidv1()
const AUDIENCE_ID = 'authorization-id'

export const JWTDecryptOption = {
	issuer: ISSUER_ID,
	audience: AUDIENCE_ID,
}

// this 'TOKEN_SECRET' constant is used for token authrozition, in case of security reasons
// it can be changed immediately
const TOKEN_SECRET_V1 = generateSecret('HS256')
export const TOKEN_SECRET = TOKEN_SECRET_V1
const COOKIE_SECRET_V1 = 'for test'
export const COOKIE_SECRET = COOKIE_SECRET_V1
const SIGN_SECRET_V1 = 'for test'
export const SIGN_SECRET = SIGN_SECRET_V1

// this 'PASSWORD_SECRET' constant is used for user password salt, ensure maximum account safety
// it may be changed frequently, and alart user to change their password
const PASSWORD_SECRET_V1 = 'password test'
export const PASSWORD_SECRET = PASSWORD_SECRET_V1

export const whitelist = [
	'localhost:5001',
	'http://localhost:3000',
	'http://localhost:3001',
	'http://192.168.10.59:5000',
	'http://192.168.10.59:5050',
	'http://localhost:5050',
	'http://127.0.0.1:5050',
	'http://127.0.0.1:3000',
	'https://localhost:5050',
	'https://localhost:5001',
	'https://127.0.0.1:5001',
	'https://127.0.0.1:5050',
	'https://127.0.0.1:5500',
	'http://localhost:56926',
	'http://192.168.10.59:3000',
	'http://192.168.10.59:56926',
	'http://192.168.10.59:62558',
	'postman',
]
