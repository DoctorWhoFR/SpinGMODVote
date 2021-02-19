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

const { Command } = require('discord.js-commando');
const { JsonDB } = require( 'node-json-db' );
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
 
// The second argument is used to tell the DB to save after each push
// If you put false, you'll have to call the save() method.
// The third argument is to ask JsonDB to save the database in an human readable format. (default false)
// The last argument is the separator. By default it's slash (/)
var db = new JsonDB(new Config("GMODVote", true, false, '/'));

module.exports = class registerCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'register',
			aliases: ['rg'],
			group: 'vote',
			memberName: 'register',
			description: 'Vous permet de vous enregistrez !',
			args: [
				{
					key: 'steam',
					prompt: 'Votre steam id?',
					type: 'string',
				},
			],
		});
	}
	
	run(message, {steam}) {
		const author = message.author;
		const author_tag_msg = author.username + "#" + author.discriminator;

		try {
			var data = db.getData("/users/"+author.id);
			db.push("/users/"+author.id, {id: author.id, steam_id: steam, name: author.username})
			console.log(data);
		} catch(error) {
			// The error will tell you where the DataPath stopped. In this case test1
			// Since /test1/test does't exist.
			db.push("/users/"+author.id, {id: author.id, steam_id: steam, name: author.username}, true)
			console.error(error);
		};
		author.send('Enregistrement de votre compte effectuer avec succès ! vous pouvez maintenant allez votez ici https://top-serveurs.net/garrys-mod/vote/frdioxy-darkrp-new-serveur; mettez en pseudo: ``' + author_tag_msg + '``' );
	
		message.delete();
	
	}


};