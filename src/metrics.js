const { AmqpManager, Middlewares } = require("@molfar/amqp-client")
const { collectDefaultMetrics, register } = require('prom-client');

module.exports = async (instanceId, config) => {

	collectDefaultMetrics({
		timeout: config["time-interval"] || 1000,
		prefix: "container_node_"
	});

	let publisher = (config && config.transport) ? await AmqpManager.createPublisher(config.transport) : null
	if ( publisher ) await publisher.use(Middlewares.Json.stringify)
	let interval

	const createMessage = async() => ({
		loggedAt: new Date(),
		instance: instanceId,
		metrics: await register.getMetricsAsJSON()
	})
	
	const metrics = {

		start: () => {
			interval = setInterval( async () => {
				if( publisher ) publisher.send(await createMessage())
			}, config["time-interval"] || 1000)
		},

		stop: () => {
			if (interval) clearInterval(interval)
		}
	}	

	return metrics
}


