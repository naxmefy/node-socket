# @naxmefy/socket

### Installation

```
$ npm install @naxmefy/socket --save
```

### Usage

For detailed usage, see Node.js documentation on net.Socket - https://nodejs.org/api/net.html#net_class_net_socket.

Quick example:

```javascript
const Socket = require('@naxmefy/socket')
var socket = Socket.connect(1337, 'localhost')

socket.setEncoding('utf8')
socket.on('connect', function () {
	// connected

socket.end('hey')
	socket.destroy()
})
```

**HINT**: To prevent socket from reconnecting, use `.destroy()` method to completely close it.

### Tests

```
$ npm test
```

### License

MIT
