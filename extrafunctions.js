const fs = require('fs');

module.exports = {
    //Create a random hexcode corresponding to a color
    randomHexCode: function(){
        var hexcode = "#";
        for(i=0; i<6; i++){
            var value;
            var randInt = Math.floor(Math.random() * 16);
            switch(randInt){
                case 0:  value = "A"; break;
                case 1:  value = "B"; break;
                case 2:  value = "C"; break;
                case 3:  value = "D"; break;
                case 4:  value = "E"; break;
                case 5:  value = "F"; break;
                case 6:  value = "0"; break;
                case 7:  value = "1"; break;
                case 8:  value = "2"; break;
                case 9:  value = "3"; break;
                case 10: value = "4"; break;
                case 11: value = "5"; break;
                case 12: value = "6"; break;
                case 13: value = "7"; break;
                case 14: value = "8"; break;
                case 15: value = "9"; break;        
            }   
            hexcode += value;
        }
        return hexcode;
    }, 

    //Find a specified file or return a randomly selected file
    findFile: function (search_name, filePath) {
        const filePattern = /\d+/g;
        const folder = fs.readdirSync(filePath) //Array of all files
        var withinSizeLimit = false;
        const discordSizeLimit = 8388608; //8MB picture size limit (in bytes)
        var name, fileSize;

        if (isNaN(Number(args[1]))) {
            while (!withinSizeLimit) {
                randNum = Math.floor(Math.random() * folder.length) + 1;
                name = folder[randNum];
                withinSizeLimit = true;
                fileSize = fs.statSync(filePath + name)["size"];
                if (fileSize > discordSizeLimit) {
                    withinSizeLimit = false;
                }
            }
        } else {
            folder.forEach(file_name => {
                if (search_name == file_name.match(filePattern)) {
                    name = file_name;
                    fileSize = fs.statSync(filePath + name)["size"];
                    withinSizeLimit = true;
                    if (fileSize > discordSizeLimit) {
                        withinSizeLimit = false;
                    }
                }
            })
        }
        return [(filePath + name), withinSizeLimit];
    }
}


