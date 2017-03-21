var EventBus = require('./index');
var eventbus = new EventBus('tcp://10.0.0.3');

eventbus.on('#', (message) => {
	console.log('message');
});

eventbus.on('partyalarm', (message) => {

	console.log('ayayayayayayayayayayayayayay');
});