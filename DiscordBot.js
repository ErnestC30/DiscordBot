//COOL DISCORD BOT
const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token} = require('./config.json');
const extraFunctions = require('./extrafunctions.js');
const fs = require ('fs');
const sqlite3 = require('sqlite3');
//Regular expression patterns
const argsPattern = /"\w+(\s\w+)*"|[\!\<\@\>\#\(\)]*\w+[\!\<\@\>\#\(\)]*/g;
const hexPattern = /\#[0123456789ABCDEFabcdef]{6}/g;
//Global variables

client.on('ready', () => {
    console.log("Connected as " + client.user.tag)
})

client.on('message', (message) => {                                 
    //Split the content of the Message object into array of words with args[0] being the command
    args = message.content.match(argsPattern)
    textMessage = true
    if (args === null){
        textMessage = false
    }

    if (textMessage){
        //Command list

        if (args[0] == prefix + "say") {
            /*Makes the bot say the given message, and in a specific channel if given:
              e.g. !say hello       -> print 'hello' in current channel
                   !say #main hello -> print 'hello' in #main channel
            */
            var changeChannel = false
            var channelID
            const channelList = []
            //Store all text channels in the server into channelList
            message.guild.channels.cache.forEach((channel) => {
                if (channel.type == "text") {
                    channelList.push(channel)
                }
            })
            //Get channelID if channel specified in argument (ex. #channel)
            for (i = 0; i < channelList.length; i++) {
                if ("<#" + channelList[i].id + ">" == args[1]) {
                    changeChannel = true
                    channelID = channelList[i].id
                }
            }
            if (changeChannel) {
                msg = message.content.slice((args[0] + args[1] + 1).length)
                client.channels.fetch(channelID)
                    .then(channel => channel.send(msg))
                    .then(message => console.log(`Message sent: ${message.content}`))
                    .catch(console.error)
            } else {
                msg = message.content.slice(args[0].length)
                message.channel.send(msg)
                    .then(message => console.log(`Message sent: ${message.content}`))
                    .catch(console.error)
            }
        }

        if (args[0] == prefix + "channels") {
            /*Shows each text channel in the server: 
            */
            const channelList = []
            message.guild.channels.cache.forEach((channel) => {
                if (channel.type == "text") {
                    channelList.push(channel)
                }
            })
            message.channel.send(channelList)
                .then(message => console.log(`Message sent: ${message.content}`))
                .catch(console.error)
        }

        if (args[0] == prefix + "myroles") {
            /*Shows roles, and allows users to add or remove roles to themselves:
              e.g. !myroles                                      
                   !myroles add (role) 
                   !myroles remove (role)       
              Multiple roles can be added at once by separating args with a space. 
              Roles containing spaces can be selected using " ".                  
            */
            memberRolesList = []
            message.member.roles.cache.forEach((role) => {
                if (role.name != "@everyone") {
                    memberRolesList.push(role.name)
                }
            })
            guildRolesList = []
            message.guild.roles.cache.forEach((role) => {
                if (role.name != "@everyone") {
                    guildRolesList.push(role.name)
                }
            })

            //Display current roles if 'add' or 'remove' argument not given.
            if (args[1] != "add" && args[1] != "remove") {
                var roleMessage = `You have the following roles: \n`
                memberRolesList.forEach(roleName => {
                    roleMessage += (`\`${roleName}\`\n`)
                })
                message.channel.send(roleMessage)
            }

            if (args[1] == "add") {
                for (i = 2; i < args.length; i++) {
                    if (args[i].startsWith('"')) {
                        var roleName = args[i].slice(1, args[i].length - 1)
                    } else {
                        var roleName = args[i]
                    }
                    if (guildRolesList.includes(roleName)) {
                        var role = message.guild.roles.cache.find(role => role.name === roleName)
                        if (message.member.roles.cache.find(role => role.name === roleName)) {
                            message.channel.send(`You already have the role: \`${roleName}\`.`)
                        } else {
                            message.member.roles.add(role)
                                .then(message.channel.send(`\`${roleName}\` has been added.`))
                                .catch(error => console.log(error))
                        }
                    } else {
                        message.channel.send(`\`${roleName}\` is not a role.`)
                    }
                }
            }
            if (args[1] == "remove") {
                for (i = 2; i < args.length; i++) {
                    if (args[i].startsWith('"')) {
                        var roleName = args[i].slice(1, args[i].length - 1)
                    } else {
                        var roleName = args[i]
                    }
                    if (guildRolesList.includes(roleName)) {
                        var role = message.guild.roles.cache.find(role => role.name === roleName)
                        if (!message.member.roles.cache.find(role => role.name === roleName)){
                            message.channel.send(`You do not have the role: \`${roleName}\`.`)
                        } else {
                            message.member.roles.remove(role)
                                .then(message.channel.send(`\`${roleName}\` has been removed.`))
                                .catch(error => console.log(error))
                        }
                    } else {
                        message.channel.send(`\`${roleName}\` is not a role.`)
                    }
                }
            }
        }

        //Creates or deletes a new guild roles:                                   
        if (args[0] == prefix + "guildroles") {
            /* Create, delete, or view roles in the server
               e.g. !guildroles create (role)
                    !guildroles delete (role)
                    !guildroles view
               When creating role, can have hexcode after 'create' to pick a color.
               For roles with space, use "" surrounding the role name.
            */
            var RoleName, RoleColor

            if (typeof args[2] === 'string') {
                if (args[2].startsWith('"')) {
                    RoleName = args[2].slice(1, args[2].length - 1)
                } else {
                    RoleName = args[2]
                }
            }

            //Choosing color for role (random unless given hexcode argument)
            if (hexPattern.test(args[3])) {
                RoleColor = args[3]
            } else {
                RoleColor = extraFunctions.randomHexCode();
            }

            guildRolesList = []
            message.guild.roles.cache.forEach((role) => {
                if (role.name != "@everyone") {
                    guildRolesList.push(role.name)
                }
            })

            if (args[1] == "create") {
                if (guildRolesList.includes(RoleName)) {
                    message.channel.send("This role already exists.")
                } else {
                    message.channel.guild.roles.create({
                        data: {
                            name: RoleName,
                            color: RoleColor
                        }
                    })
                    .then(role => console.log(`${role.name} has been created`))
                    .then(message.channel.send(`The role \`${RoleName}\` has been created`))
                    .catch(error => console.log(error))
                }
            }
            else if (args[1] == "delete") {
                if (guildRolesList.includes(RoleName)) {
                    message.guild.roles.cache.forEach((role) => {
                        if (role.name == RoleName) {
                            role.delete()
                            .then(role => console.log(`${role.name} has been deleted`))
                            .then(message.channel.send(`The role \`${RoleName}\` has been deleted`))
                        }
                    })
                } else {
                    message.channel.send("This role does not exist.")
                }
            }
            else if (args[1] == "view") {
                message.channel.send("The roles in this guild are: ")
                message.channel.send(guildRolesList)
            } else {
                message.channel.send("Needs either a 'create', 'delete', or 'view' command after !guildroles")
            }
        }

        if (args[0] == prefix + "wallpaper") {
            /*Posts an image from the wallpapers folder. An image filename can be specified or randomly selected.
            e.g. !wallpaper 10
                 !wallpaper
            */
            folderPath = ".\\wallpapers\\"
            var fileName = extraFunctions.findFile(args[1], folderPath) //Returns wallpaper file path

            if (!fileName[1]) { //i.e. file size too large
                message.channel.send("The file size for this wallpaper is too large for Discord.")
            } else {
                picture = new Discord.MessageAttachment(fileName[0])
                message.channel.send("Here's your picture:", picture)
            }
        }

        if (args[0] == prefix + "avatar") {
            /* Displays the selected user's avatar, if available.
               e.g. !avatar @user 
            */

            var targetID = args[1].slice(3, args[1].length - 1)
            //membersList = message.channel.members.map(member => member.id)
            membersList = message.guild.members.cache.map(member => member.id)

            if (membersList.includes(targetID)) {
                var targetID = args[1].slice(3, args[1].length - 1)
                message.guild.members.fetch(targetID)
                    .then(guildmember => {
                        var imageLink = guildmember.user.avatarURL()
                        if (imageLink == null) {
                            message.channel.send("This user does not have an avatar.")
                        } else {
                            message.channel.send(imageLink)
                        }
                    })
            } else {
                message.channel.send("This user is not in the channel.")
            }
        }

        if (args[0] == prefix + "startgiveaway") {
            /* Giveaway function that pings the winner after x seconds.
               Requires a keyword and time argument to start.
               e.g. !startgiveaway keyword time
                    !giveaway keyword to join the giveaway.
            */
            let [, keyword, timer] = args; //Array Destructuring
            let participants = [];
            let startError = false;

            if (isNaN(Number(timer))) {
                message.channel.send("Missing a timer (in seconds).");
                startError = true;
            }
            if (keyword == null) {
                message.channel.send("Missing a keyword for entry.")
                startError = true;
            }
            if (!startError) {
                async function findWinner(key, timer, participants) {
                    findWinner = new Promise((resolve, reject) => {   //Creating promise that returns winner message after giveaway time ends.
                        let filter = m => { return m.content.includes(`!giveaway ${key}`) && !(m.author.bot) };
                        collector = new Discord.MessageCollector(message.channel, filter, { time: timer * 1000 });
                        message.channel.send(`A giveaway has started, to enter type: \`!giveaway ${keyword}\`.`);

                        collector.on('collect', (msg) => {
                            message.channel.send(`\`${msg.author.username}\` has been added to the giveaway.`)
                        })

                        collector.on('end', collected => {
                            message.channel.send('The giveaway has ended.');
                            collected.forEach(msg => {
                                if (!participants.includes(msg.author.id)) {
                                    participants.push(msg.author.id);
                                }
                            })
                            winner_ind = Math.floor(Math.random() * participants.length);
                            if (participants.length == 0) {
                                resolve("No one has joined this giveaway :(");
                            } else {
                                resolve(`The winner is <@${participants[winner_ind]}>.`);
                            }
                        })
                    })
                    let end_message = await findWinner;
                    message.channel.send(end_message);
                }
                findWinner(keyword, timer, participants);
            }
        }

        //strawpoll function?

        //giphy/other gif database interaction1

        //Shows all the available commands and how to use:
        if (args[0] == prefix + "help") {
            message.channel.send(`\`\`\`Mandatory arguments are in (), optional arguments in []
Here are the bot commands: 
!avatar @(user): displays the user's avatar.

!channels: displays the all text channels in the server.
!help: show all available bot 

!guildroles [create/delete rolename] [hexcode]: create or delete a role, can enter optional hexcode after name for specific role color.
!guildroles view: view all roles in the server.

!myroles [add/remove *rolename]: include no arguments to show all your current roles. add/remove argument to modify roles. can take multiple role names at once.

!say [channel] (text): makes the bot say text in the current or specified channel.

!startgiveaway (keyword) (time): creates a giveaway with a specified keyword.

!wallpaper [number]: posts either a random wallpaper or specified number wallpaper.\`\`\``)
        }
    }
})

client.login(token);