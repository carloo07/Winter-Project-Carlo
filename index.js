const { Client, Collection } = require("discord.js");
const config = require(`./config.json`);
const { prefix, db, token } = require("./config.json");
const Discord = require("discord.js");
const DiscordSlash = require("discord.js-slash-command")
const client = new Client({
  disableEveryone: true
});
require("discord-buttons")(client)
//--------WELCOME---------
const { createCanvas, loadImage, registerFont } = require("canvas");
//--------MUSIC - CLIENT------
const { Player } = require('discord-player');
const fs = require("fs")
client.player = new Player(client);

//-----database-------
const {Database} = require("quickmongo")
//Collection
client.db =  new Database(db)
client.commands = new Collection();
client.aliases = new Collection();
client.queue = new Map();
client.snipes = new Map();

["command"].forEach(handler => {
  require(`./handlers/${handler}`)(client);
});


const mongoose = require("mongoose");

mongoose
  .connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(console.log("Connected to mongo db"));
const player = fs.readdirSync('./player').filter(file => file.endsWith('.js'));


//RANKS
const Levels = require("discord-xp");
Levels.setURL(db);


for (const file of player) {
    //console.log(`Loading discord-player event ${file}`);
    const event = require(`./player/${file}`);
    client.player.on(file.split(".")[0], event.bind(null, client));
};
client.on("ready", () => {
  console.log(`Hi, ${client.user.username} is now online!`);

  client.user.setActivity("c!help - Carlo 1st!");
});

client.on("messageDelete",async (message) => {

  client.snipes.set(message.channel.id,{
content : message.content,
author: message.author.tag,
image: message.attachments.first() ? message.attachments.first().proxyURL : null

  })
})



//ANTI-MENTION
client.on("message",async message => {
  
if(message.mentions.members.array().length >= 4){
  
 if(message){
   await  message.delete()
 } 
return message.reply(`You are not allow to mention mass members!`) 
  
}
 
})

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.guild) return;

        const randomXp = Math.floor(Math.random() * 98) + 1;
        const level = await Levels.appendXp(
          message.author.id,
          message.guild.id,
          randomXp
        );
        if (level) {
          const user = await Levels.fetch(message.author.id, message.guild.id);
          message.channel
            .send(
              ` ${message.author.username}, You just leveled up to level ${user.level}!`
            )
            .then((m) => m.delete({ timeout: 10000 }));
        }

//AFK SYSTEM 
 //IF YOU  WANT MAKE GLOABAL AFK SYSTEM  JUST  REMOVE SERVER ID
  
  if (!message.content.startsWith(prefix)) return;

  // If message.member is uncached, cache it.
  if (!message.member)
    message.member = await message.guild.fetchMember(message);

  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);
  const cmd = args.shift().toLowerCase();

  if (cmd.length === 0) return;

  let command = client.commands.get(cmd);
  if (!command) command = client.commands.get(client.aliases.get(cmd));

  // If a command is finally found, run the command
  if (command) command.run(client, message, args);
});

client.on("message", async message => {
  if (message.content === "!welcome") {
    client.emit("guildMemberAdd", message.member);
  }
});
client.on("guildMemberAdd", async member => {

let message = `${member} welcome to ${member.guild.name}`

let channel = await client.db.get(`channel_${member.guild.id}`)

if(!channel)return;

client.channels.cache.get(channel).send(message)

});
client.login(config.token);
