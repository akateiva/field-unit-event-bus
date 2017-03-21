var mqtt = require('mqtt');
var winston = require('winston');
var EventEmitter = require('events');


module.exports = class EventBus{
	/**
	 * public constructor
	 * connects to MQTT
	 * @param  {String} mqttHost broker host string
	 * @return {void} 
	 */
	constructor(mqttHost){
		this.events = new EventEmitter();

		this.client = mqtt.connect(mqttHost);	//connect to the MQTT broker
		this.client.on('message', this._onMqttMessage.bind(this));
		this.client.on('connect', this._onMqttConnect.bind(this));
		this.client.on('offline', this._onMqttOffline.bind(this));
		this.client.on('error', this._onMqttError.bind(this));
	}

	/**
	 * private onMqttMessage
	 * passes MQTT messages to EventBus subscribers
	 * @param  {String} topic
	 * @param  {Buffer} message
	 * @return {void}
	 */
	_onMqttMessage(topic, message){

		//In case message is empty string or malformed JSON, 
		try{
			message = JSON.parse(message.toString());
		}catch(e){
			message = {};
		}

		winston.info("Handling message for %s", topic);
		this.events.emit('#', message, topic);
		this.events.emit(topic, message, topic);
	}

	_onMqttConnect(){
		winston.info("Connected to broker");
	}

	_onMqttOffline(){
		winston.info("Client offline");
	}
	_onMqttError(){
		winston.info("MQTT error");
	}

	/**
	 * public on
	 * attaches a message callback to a topic and subscribes to that topic
	 * @param  {String}   topic
	 * @param  {Function} callback({String} topic, {JSON} message payload)
	 * @return {void}
	 */
	on(topic, callback){
		this.client.subscribe(topic);
		this.events.on(topic, callback);
	}

	/**
	 * public emit
	 * publishes a message to MQTT
	 * @param  {String}   topic
	 * @param  {JSON}   payload  	
	 * @param  {Function} callback 
	 * @return {[type]}            
	 */
	emit(topic, payload, callback){
		this.client.publish(topic, JSON.stringify(payload));
	}
};


