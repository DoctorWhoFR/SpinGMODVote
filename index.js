/*
 *   Copyright (c) 2021 4Azgin

 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.

 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.

 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const { CommandoClient } = require('discord.js-commando');
const path = require('path');
var axios = require('axios');
const { JsonDB } = require( 'node-json-db' );
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
let Rcon = require('srcds-rcon');
 
// The second argument is used to tell the DB to save after each push
// If you put false, you'll have to call the save() method.
// The third argument is to ask JsonDB to save the database in an human readable format. (default false)
// The last argument is the separator. By default it's slash (/)
var db = new JsonDB(new Config("GMODVote", true, false, '/'));

const config = require('./config.json');

try {
    var data = db.getData("/users/");
} catch(error) {
    // The error will tell you where the DataPath stopped. In this case test1
    // Since /test1/test does't exist.
	db.push("/users/", {})
};

const client = new CommandoClient({
	commandPrefix: config.prefix,
	owner: config.owner,
	invite: config.invite,
});

client.registry
	.registerDefaultTypes()
	.registerGroups([
		['vote', 'Commandes de votes'],
		['second', 'Your Second Command Group'],
	])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, 'commands'));
	

function getUserVote(author, author_tag){

	return new Promise((resolve,reject) => {	
	
	
		try {
			db.reload();
			var datda = db.getData("/users/"+author.id);
		} catch (error) {
			return resolve(false);
		}
					
		var configd = {
		  method: 'get',
		  url: 'https://api.top-serveurs.net/v1/votes/claim-username?server_token='+config.server_token+'&playername=' + author_tag,
		  headers: { 
			'Content-Type': 'application/json', 
			'Accept': 'application/json', 
		  }
		};
	
		axios(configd)
		.then(function (response) {
			const data = response.data;
			resolve(data.claimed)
		})
		.catch(function (error) {
		  console.log(error);
		});
	
	
	})
}


client.once('ready', async () => {
	console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
	client.user.setActivity('with Commando');
	client.user.setStatus('online'); 
	const _guild = client.guilds.cache.get(config.guild_id); 
	setInterval(() => {
		console.log('checking for votes for all players')
		_guild.members.cache.forEach(async (member)=>{

			const author = member.user;
			const author_tag = author.username + "%23" + author.discriminator;
			const author_tag_msg = author.username + "#" + author.discriminator;

			var claim = await getUserVote(author, author_tag);
			if(claim != false){
				console.log(config.dark_money)

				if(claim == 1){

					
					try {
						db.reload();

						var datda = db.getData("/users/"+author.id);

						let rcon = Rcon({
							address: config.server_ip,
							password: config.server_password,
						});
						rcon.connect().then(() => {
							console.log('connected');
							return rcon.command('ulx addmoney ' + datda.steam_id + " " + config.dark_money).then(() => {
							});
						}).catch(console.error);

					} catch (error) {


						
					}
					
					
				}
			}
		})
	}, (config.money_interval * 1000), config);

	
});

client.on('error', console.error);

client.login(config.token);

/**
**/