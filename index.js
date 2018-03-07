const delegate = require('delegates')
const net = require('net')

const defaultErrorsToAvoud = [
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT'
]

function Socket(options) {
    if (!options) options = {}
    this.socket = new net.Socket(options)
    this.socket._errorsToAvoid = options.errorsToAvoid || defaultErrorsToAvoud
    this.monitor()
}

const socket = Socket.prototype

/**
 * Connect to socket server. View net.Socket#connect
 */
socket.connect = function () {
    this._connectArgs = arguments
    return this.socket.connect.apply(this.socket, arguments)
}

/**
 * Stop socket monitoring.
 */
socket.destroy = function () {
    clearTimeout(this._connectTimeout)
    this.socket.removeAllListeners()
    return this.socket.destroy()
}

/**
 * Monitor current socket connection and reconnect if
 * connection closed or error popped up.
 */
socket.monitor = function () {
    const self = this
    const backoff = 1.5

    var delay = 1000

    this.socket.on('connect', function () {
        clearTimeout(this._connectTimeout)
        delay = 1000
    })

    this.socket.on('close', function () {
        this._connectTimeout = setTimeout(function () {
            self._reconnect()
        }, delay)
    })

    this.socket.on('error', function (err) {
        if (this._errorsToAvoid.indexOf(err.code) >= 0) {
            this._connectTimout = setTimeout(function () {
                self._reconnect()
            }, delay)

            // TODO verify delay *= backoff
            return
        }

        throw err
    })
}

socket._reconnect = function () {
    if (this.socket._connecting) return

    return this.socket.connect.apply(this.socket, this._connectArgs)
}


/**
 * Proxy net.Socket methods and properties
 */
var methods = [
    // net.Socket
    'setEncoding',
    'write',
    'end',
    'pause',
    'resume',
    'setTimeout',
    'setNoDelay',
    'setKeepAlive',
    'address',
    'unref',
    'ref',

    // EventEmitter
    'addListener',
    'on',
    'once',
    'removeListener',
    'removeAllListeners',
    'setMaxListeners',
    'listeners',
    'emit'
]

var properties = [
    // net.Socket
    'bufferSize',
    'remoteAddress',
    'remoteFamily',
    'remotePort',
    'localAddress',
    'localPort',
    'bytesRead',
    'bytesWritten',

    // EventEmitter
    'defaultMaxListeners',
]

methods.forEach(function (method) {
    socket[method] = function () {
        return this.socket[method].apply(this.socket, arguments)
    }
})

properties.forEach(function (property) {
    delegate(socket, 'socket').access(property)
})

exports = module.exports = Socket

/**
 * Expose connect method
 */
exports.connect = exports.createConnection = function (port, host, connectionListener) {
    var options = {}

    if (typeof port === 'object') options = port
    if (typeof port === 'string') options.path = port
    if (typeof port === 'number') options.port = port

    if (typeof host === 'function') connectionListener = host
    if (typeof host === 'string') options.host = host

    var socket = new Socket()
    socket.connect(options, connectionListener)
    return socket
}
