const fs = require("fs")
const path = require("path")

const { Container } = require("@molfar/csc")
const { yaml2js } = require("@molfar/amqp-client")


const schedulerPath = path.resolve(__dirname, "./service/scheduler.js")
const schedulerConfig = yaml2js(fs.readFileSync(path.resolve(__dirname, "./msapi/scheduler.msapi.yaml")).toString())


const delay = interval => new Promise( resolve => {
	setTimeout( () => {
		resolve()
	}, interval )	
}) 

const run = async () => {

	const container = new Container()

	container.hold(schedulerPath, "--scheduler--")
	const scheduler = await container.startInstance(container.getService(s => s.name == "--scheduler--"))
	let res = await scheduler.configure(schedulerConfig)
	console.log("Configure", res)
	res = await scheduler.start()
	console.log("Start", res)

	await delay(10000) 

	res = await scheduler.stop()
	container.terminateInstance(scheduler)
	
}

run()