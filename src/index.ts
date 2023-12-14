import express from 'express'
import cors from 'cors'
import fs from 'fs'
import cookieParser from 'cookie-parser'
// import http from 'http'
// import WebSocket from './sockets'
import https from 'https'
// import { whitelist } from '@/config/config'

const PORT = process.env.PORT || 5001

const app = express()
const server = https.createServer(
	{
		key: fs.readFileSync(__dirname + '/ssl/code.key'),
		cert: fs.readFileSync(__dirname + '/ssl/code.crt'),
	},
	app
)

app.set('x-powered-by', false)
app.use(cookieParser())
/**
 * Cors
 */
// const corsOptions = {
// 	// origin: function (origin: any, callback: any) {
// 	// 	console.log({ origin })
// 	// 	if (whitelist.indexOf(origin) !== -1) {
// 	// 		callback(null, true)
// 	// 	} else {
// 	// 		callback(new Error('Not allowed by CORS'))
// 	// 	}
// 	// },
// 	credentials: true,
// }
app.use(cors())

app.use(express.static(__dirname + '/uploads'))

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/**
 * @description All WebSocket events logic
 * sets important cookies on initial ws connection
 */
// WebSocket(server)

// app.use(require('./router/robot'))
// app.use(require('./router/upload'))
// app.use(require('./router/login'))

app.get('/', (req, res) => {
	res.json({ status: 'template server ready' })
})

server.listen(PORT, () => {
	console.log(`Exercise-Master-Server is running successfully.`)
	console.log(`Port: ${PORT}`)
	console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
