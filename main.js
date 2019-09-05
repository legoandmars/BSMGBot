const { Client, Attachment } = require('discord.js');
// Create an instance of a Discord client
const client = new Client();
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas')
const config = require('./config.json');
const GoogleImages = require('google-images');
const mwdict = require('mw-dict');
const dict = new mwdict.CollegiateDictionary(config.dictionaryCollegiateKey);
 

const imageClient = new GoogleImages(config.googleCustomSearchEngineId, config.googleApiKey);


function randomWordFunction(){
    var bsmgGuild = client.guilds.get(config.discordGuildID);
    var currentChannel = client.channels.get(config.discordChannelID);
    var randomMWord = mArray[Math.floor(Math.random()*mArray.length)].toLowerCase();
    var formattedMWord = randomMWord.charAt(0).toUpperCase() + randomMWord.slice(1)
    console.log(formattedMWord);
    dict
    .lookup(formattedMWord)
    .then(result => {
        //console.log(result);
        //Object.values(result[0].definition[0])
        var meaningChart = [];
        if(result[0].definition[0]["meanings"]){
            for(var i = 0; i < result[0].definition[0]["meanings"].length;){
                var currentMeaning = result[0].definition[0]["meanings"][i];
                if(currentMeaning != ":"){
                    meaningChart.push(currentMeaning);
                }
                i++;
            }
        }
        if(result[0].definition[0]["senses"]){
            var allSenses = result[0].definition[0]["senses"]
            //console.log(allSenses[i])
            for(var i = 0; i < allSenses.length;){
                if(allSenses[i]["meanings"]){
                    for(var x = 0; x < allSenses[i]["meanings"].length;){
                        var currentMeaning = allSenses[i]["meanings"][x];
                        if(currentMeaning != ":"){
                            meaningChart.push(currentMeaning);
                        }
                        x++;
                    }
                }
                i++;
            }
        }
        var concString = ""
        for(var i = 0; i<meaningChart.length;){
            var currentMeaning = meaningChart[i];
            var firstTwoLetters = currentMeaning.substr(0, 2);
            console.log(firstTwoLetters);
            if(firstTwoLetters == ": "){
                concString+="\n"+currentMeaning.substr(2)+",";
            }else{
                concString+="\n"+currentMeaning+",";
            }
            i++;
        }
        var currentName = "Beat Saber "+formattedMWord+" Group";
        var messageString = "We are now the "+currentName+".\n\n"+formattedMWord+" Definition:```"+concString+"```";     
        imageClient.search(formattedMWord, {size:"medium"})
        .then(images => {
            //console.log(images[0].url);
            //var myimg = loadImage(images[0].url);
            //console.log(myimg)
            loadImage(images[0].url).then((image) => {
                //ctx.drawImage(image, 50, 0, 70, 70)
                var canvas = createCanvas(512, 512)
                var ctx = canvas.getContext('2d')
                ctx.drawImage(image, 0, 0, 512, 512)    
                loadImage("BSMG_TRANSPARENT.png").then((image2) => {
                    ctx.drawImage(image2, 0, 0, 512, 512)   
                    var bufferedCanvas = canvas.toBuffer();   
                    var base64Canvas = canvas.toDataURL(); 
                    fs.writeFileSync('images/BeatSaber'+formattedMWord+'Group.png', bufferedCanvas)
                    client.user.setAvatar(bufferedCanvas)
                        .then(user => console.log(`New avatar set!`))
                        .catch(console.error);
                    bsmgGuild.edit({
                        name: currentName,
                        icon: base64Canvas
                    })
                        .then(g => console.log(`Changed server name to ${g} and icon to ${g.iconURL}`))
                        .catch(console.error);   
                    var attachment = new Attachment(bufferedCanvas);
                    currentChannel.send(messageString,attachment); 
                })
                //console.log('<img src="' + canvas.toDataURL() + '" />')
            }).catch(error =>{
                console.log("ERR");
                console.error(error);
                randomWordFunction();
            });
        });   
    
        console.log(meaningChart);
    })
    .catch(error => {
        console.log("NO DEFINITION");
        randomWordFunction();
    })
    //currentChannel.send(formattedMWord);
    //console.log(formattedMWord);
//},1800000) 
}

client.once('ready', () => {
    console.log('BS**M**G Bot Starting');
    //console.log(bsmgGuild.first(1));
    fs.readFile("words.txt", 'utf8', function(err, data){
        if(err) throw err;
        //console.log(data);
        var lines = data.split('\n');
        lines.forEach(checkForCompatibility)
        /*do something with */ 
        //console.log(lines[Math.floor(Math.random()*lines.length)]);
        //getRandomLine("words.txt");
        randomWordFunction();
        setInterval(randomWordFunction,1800000) 
    })    
});
var mArray = [];

//note this will be async

function checkForCompatibility(item,index){
    if(item.toLowerCase().startsWith("m")){
        mArray.push(item);
        //console.log(item);
    }
}
client.login(config.discordBotToken);
