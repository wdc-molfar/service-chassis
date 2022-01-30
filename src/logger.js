const { AmqpManager, Middlewares } = require("@molfar/amqp-client")
const { format } = require ("util")


module.exports = async (instanceId, config) => {

	let publisher = {
		log: (config && config.log) ? await AmqpManager.createPublisher(config.log) : null,
		debug: (config && config.debug) ? await AmqpManager.createPublisher(config.debug) : null,
		error: (config && config.error) ? await AmqpManager.createPublisher(config.error) : null
	}
	
	if (publisher.log) await publisher.log.use(Middlewares.Json.stringify)
	if (publisher.debug) {
		await publisher.debug.use(Middlewares.Json.stringify)
	} else {
		publisher.debug = publisher.log
	}	
		
	if (publisher.error) {
		await publisher.error.use(Middlewares.Json.stringify)
	} else {
		publisher.error = publisher.log
	}	

	const createMessage = element => ({
		loggedAt: new Date(),
		instance: instanceId,
		message: format(element)
	})
	
	let logger = {
		
		log: function () { 
		    [...arguments].forEach( element => {
		        if(publisher.log) publisher.log.send(createMessage(element))	
		    })
		},

		debug: function () { 
		    [...arguments].forEach( element => {
		        if(publisher.debug) publisher.debug.send(createMessage(element))	
		    })
		},
		
		error: function () { 
		    [...arguments].forEach( element => {
		        if(publisher.log) publisher.debug.send(createMessage(element))	
		    })
		}
	}	

	return logger
}


