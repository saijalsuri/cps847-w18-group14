const request = require ('request');
var sleep = require('system-sleep');


var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var rtm = new RtmClient('xoxb-310982076739-hjsoymmsv2WyhZ3SbTWIhqHq');

var EventEmitter = require("events").EventEmitter;
var body = new EventEmitter();


rtm.start();
let channel;
let bot;

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
      if (c.is_member && c.name ==='repeatbotchannel') { channel = c.id }
  }
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`);
   bot = '<@' + rtmStartData.self.id + '>';
});

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
  rtm.sendMessage("Hello!", channel);
  
/* rtm.on(RTM_EVENTS.MESSAGE, function(message) {
    if (message.channel === channel)
        rtm.sendMessage("<@" + message.user + "> said " + message.text, message.channel);

	});
 */


function mygeo(city, country)
{
	return new Promise(function(resolve, reject){
		request({
		url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+city+',+'+country+'&key=AIzaSyBKGGEsrQJREpZsMh4YIdjfhvlIs-K36bY',
		json: true
		},(error, response, body) => {
		if (error) return reject(error);
		try{
			
		var locLat = body.results[0].geometry.location.lat;
		var locLng = body.results[0].geometry.location.lng;
		console.log(locLat);
		console.log(locLng);
		//getweather(locLat,locLng);
		//var tempArray = [locLat, locLng];
		let thecurrenttemp;
		
		getweather(locLat,locLng).then(function(val) {
		console.log(val);
		thecurrenttemp = val;
		resolve(thecurrenttemp);
		}).catch(function(err) {
		console.err(err);
		});
		
		//resolve(tempArray);
		//console.log(tempArray);		
		//return tempArray;
			
		} catch (error){
			reject(error);
		}
		
	});
});
};	

function getweather(lat,lng)
{
	return new Promise(function(resolve, reject){
		request({
		url: 'https://api.darksky.net/forecast/ba8ed164ac5b2d10d5fc6fffcb55f93a/'+lat+','+lng+'?units=si',
		json: true
		},(error, response, body) => {
		if (error) return reject(error);
		try{
		var getTemp = body.currently.temperature;
		//console.log(getTemp);
		resolve(getTemp);
			
		} catch (error){
			reject(error);
		}
		
	});
});
};																																								
 
 
rtm.on(RTM_EVENTS.MESSAGE, function(message) {
    if (message.channel === channel) {
		console.log(message);
        if (message.text !== null) {
            var pieces = message.text.split(' ');
             
            if (pieces.length > 1) {
                if (pieces[0] === bot) {
                    var response = '<@' + message.user + '>';
                    var userMessage = '';
                    switch (pieces[1].toLowerCase()) {
                        case "repeat":
							var myText = message.text;
							var n = myText.indexOf("repeat");
							var n = n + 7;
							response += " " + myText.slice(n, message.length);
							rtm.sendMessage(response, message.channel);
                            break;
						case "weather":
							let temptemp;
							var myText = message.text;
							var n = myText.indexOf("weather");
							var n = n + 8;
							var theLocation = myText.slice(n, message.length);
							var theLocationArray = theLocation.split(",");
							var city = theLocationArray[0];
							var country = theLocationArray[1];
							var locLng = '';
							var locLat = '';
							//console.log("request");
							
							mygeo(city, country).then(function(val) {
							console.log(val);
							temptemp = val;
							response += "Temperature at " + city + "," + country + " is " + temptemp + " Celsius";
							rtm.sendMessage(response, message.channel);
							}).catch(function(err) {
							console.err(err);
							});
							
                            break;
							
						case "help":
							response += ", welcome to the help section. To use the repeat function, you can type:" + bot + "repeat <anything you want repeated>. If you wish to use the weather function, you can type: " + bot + "weather <city>, <country> where the country is seperated by a comma from the city.";
							rtm.sendMessage(response, message.channel);
                            break;
							
                        default:
                            response += ', sorry I do not understand the command. For a list of supported commands, type: ' + bot + ' help';
                            rtm.sendMessage(response, message.channel);
							break;
                    }
                     
                    //rtm.sendMessage(response, message.channel);
                }
            }
        }
    }
});
});