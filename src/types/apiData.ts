export interface apiLoginResObj {
	st: string // session token
	at: string
	rt: string
	code: 200
	username: string
	icon?: string
}

export interface apiRobotResObj {
	hash: string // jwt that contains {codehash, expiredate}
}

export interface loginForm {
	type: 'phone' | 'username'
	value: string
	password: string
	secure?: boolean
	hash?: string
}

export interface userRegisterObj {
	id: string
	username: string
	password: string
	phone?: string
	email?: string
}

export interface tokenGeneratorWithPsidObj {
	id: string
}
export interface tokenGeneratorWithTsidObj {
	id: string
}
