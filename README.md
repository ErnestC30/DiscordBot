Small Discord Bot project to explore interaction with the Discord API

Requires a config.json file that contains a prefix and discord token.
Run the bot using `node Discordbot.js`

Here are the bot commands: 
!avatar @(user): displays the user's avatar.

!channels: displays the all text channels in the server.
!help: show all available bot 

!guildroles [create/delete rolename] [hexcode]: create or delete a role, can enter optional hexcode after name for specific role color.
!guildroles view: view all roles in the server.

!myroles [add/remove *rolename]: include no arguments to show all your current roles. add/remove argument to modify roles. can take multiple role names at once.

!say [channel] (text): makes the bot say text in the current or specified channel.

!startgiveaway (keyword) (time): creates a giveaway with a specified keyword.

!wallpaper [number]: posts either a random wallpaper or specified number wallpaper.
