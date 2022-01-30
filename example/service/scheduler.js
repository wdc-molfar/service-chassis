 const serviceChassis = require("../../index.js")
 const fs = require("fs")
 const path = require("path")
 const { extend } = require("lodash")


 let service = new serviceChassis.ServiceWrapper({
 	publisher: null,
 	config: null,
 	
 	async onConfigure(config, resolve){
 		
 		const Middlewares = serviceChassis.Middlewares

 		this.config = config
 		
 		await this.configureLogs(config) 
	 	
 		this.publisher = await serviceChassis.AmqpManager.createPublisher(this.config.service.produce)

 		const taskCounter = new serviceChassis.promClient.Counter({
		    name: 'task',
		    help: 'Scheduler task counter',
		    labelNames: ['task'],
		});

	 	await this.publisher.use([
		    Middlewares.Schema.validator(this.config.service.produce.message),
		    Middlewares.Metric({
		        metric: taskCounter,
		        callback: (err, msg, metric) => {
		          metric.inc({ task: 'initiated' })
		        }
		     }),
		    Middlewares.Error.BreakChain,
		    Middlewares.Metric({
		        metric: taskCounter,
		        callback: (err, msg, metric) => {
		          metric.inc({ task: 'published' })
		        }
		     }),
		    Middlewares.Json.stringify
		])
	 	
	 	this.log("configure scheduler")
 		
		resolve({status: "configured"})
	
 	},

	onStart(data, resolve){
 		
 		let channels = serviceChassis.yaml2js(fs.readFileSync(path.resolve(__dirname, "./tg-channels.yaml")).toString()).url
 		channels.forEach( url => {
 			this.log("create task", url)
 			this.publisher.send({type:"telegram", url})
		})
 		
 		this.log(`initiate ${channels.length} tasks`)
 		
		resolve({status: "started"})	
 	},

 	async onStop(data, resolve){
		
		this.log("stop scheduler")
		await this.publisher.close()
		
		resolve({status: "stoped"})

	}

 })
 
 extend(service, {
 	async configureLogs(config) {
 		this.logger = await serviceChassis.createLogger(config._instance_id, config.service.logger)
        this.monitor = await serviceChassis.createMonitor (config._instance_id, config.service.monitoring)
        extend( this, this.logger )
        this.monitor.start()
 	}
 })
 
 service.start()

