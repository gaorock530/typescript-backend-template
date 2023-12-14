// 1xxxx - notice
// 200 = success
// 3xxxx - warning
// 4xxxx = error
// 5xxxx - unknown/fatal

export const errorMessages: Record<number, any> = {
	200: {
		en: 'access token ok',
	},

	201: {
		en: 'refresh token ok',
	},
	// notice
	//
	10010: {
		en: 'new user register success',
		zh: '新用户注册成功',
	},

	// warning
	//
	30001: {
		en: 'type missing',
		zh: '缺少type值',
	},
	30002: {
		en: 'value missing',
		zh: '缺少value值',
	},
	30003: {
		en: 'value already taken',
		zh: 'value已被使用',
	},
	30101: {
		en: 'Phone is already in use',
		zh: '电话号码已经被使用',
	},
	30102: {
		en: 'Username is already in use',
		zh: '用户名已被使用',
	},
	30400: {
		en: 'reached MAX robot verify limit',
		zh: '达到验证信息更换次数最大值',
	},
	30401: {
		en: 'the value already exists in robot store',
		zh: '该值已存在机器人缓存中',
	},
	30501: {
		en: 'code missing',
		zh: '缺少code值',
	},

	// errors
	//
	40001: {
		// possible hacked
		en: 'value error',
		zh: '数值错误',
	},
	40002: {
		// possible hacked
		en: 'type error',
		zh: '类型错误',
	},
	40003: {
		en: 'email error',
		zh: '电子邮箱格式错误',
	},
	40004: {
		en: 'phone error',
		zh: '手机号码格式错误',
	},
	40005: {
		en: 'empty value not allowed',
		zh: '值不能为空',
	},
	40101: {
		en: 'incorrect code',
		zh: '验证码错误',
	},
	40102: {
		en: 'code expired',
		zh: '验证码已过期',
	},
	40104: {
		en: 'validation expired, please verify again.',
		zh: '人机验证已经过期',
	},
	40105: {
		en: 'validation error',
		zh: '人机验证错误',
	},
	40106: {
		en: 'id provided not exists in database',
		zh: '数据库中不存在此id',
	},
	40201: {
		en: 'username error',
		zh: '用户名错误',
	},
	40202: {
		en: 'password error',
		zh: '密码错误',
	},
	40203: {
		en: 'phone or password error',
		zh: '手机号或密码错误',
	},
	40204: {
		en: 'username or password error',
		zh: '用户名或密码错误',
	},
	// 错误超过3次
	40205: {
		en: 'username or password error',
		zh: '用户名或密码错误',
	},
	40301: {
		en: 'no user query result',
		zh: '用户数据不存在',
	},
	40400: {
		en: 'reach incorrect rate limit',
		zh: '错误次数过多',
	},
	40401: {
		en: 'request period too short',
		zh: '操作过于频繁',
	},
	40402: {
		en: 'token expired',
		zh: 'token已过期',
	},

	// unknown/fatal
	//
	50000: {
		en: 'unknown problem',
		zh: '未知问题',
	},
	50010: {
		en: 'Server error',
		zh: '服务器网络错误',
	},
	50020: {
		en: 'Network error',
		zh: '网络错误',
	},

	50040: {
		en: 'illegal token parameter validation',
		zh: '非法参数验证token',
	},
	50050: {
		en: 'illegal request',
		zh: '非法请求',
	},
}

// export const noticeMessages: Record<number, any> = {}

export function responseOutput(
	codeNumber: number,
	lauguage: 'en' | 'zh' = 'zh'
) {
	const obj = errorMessages[codeNumber]
	if (!obj) return { error: errorMessages[50000][lauguage], code: 50000 }
	return { msg: obj[lauguage], code: codeNumber }
}

export function codeOnlyOutput(codeNumber: number) {
	return { code: codeNumber }
}

// export function warningOutput(
// 	codeNumber: number,
// 	lauguage: 'en' | 'zh' = 'zh'
// ) {
// 	const alartObj = alartMessages[codeNumber]
// 	if (!alartObj) return { error: defaultMessage[lauguage], code: 10001 }
// 	return { error: alartObj[lauguage], code: codeNumber }
// }

// export function noticeOutput(codeNumber: number, lauguage: 'en' | 'zh' = 'zh') {
// 	const obj = noticeMessages[codeNumber]
// 	if (!obj) return { error: defaultMessage[lauguage], code: 10001 }
// 	return { msg: obj[lauguage], code: 200 }
// }
