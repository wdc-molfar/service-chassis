const { ServiceWrapper } = require("@molfar/csc")
const { AmqpManager, Middlewares, yaml2js } = require("@molfar/amqp-client")
const createLogger = require("./src/logger")
const createMonitor = require("./src/metrics")
const promClient = require("prom-client")

module.exports = {
    ServiceWrapper,
    AmqpManager,
    Middlewares,
    promClient,
    createLogger,
    createMonitor,
    yaml2js
}

