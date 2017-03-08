var mqtt = require('mqtt');
var winston = require('winston');

module.exports = class EventBus{
	/**
	 * public constructor
	 * connects to MQTT
	 * @param  {String} mqttHost broker host string
	 * @return {void} 
	 */
	constructor(mqttHost){
		this.hooks = {};						//key is the topic of a message and value is a handler function
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
		if(topic in this.hooks && typeof this.hooks[topic] === "function"){
			winston.info("Handling a message", topic);

			//In case message is empty string or malformed JSON, 
			try{
				message = JSON.parse(message.toString());
			}catch(e){
				message = {};
			}

			this.hooks[topic](topic, message);
		}
	}

	/**
	 * private onMqttConnect
	 * handles a new MQTT connection
	 * @return {void}
	 */	
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
		//add unsubscribe, check if client has connected before subscribing
		this.hooks[topic] = callback;
		this.client.subscribe(topic);
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


