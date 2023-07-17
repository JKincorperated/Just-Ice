const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { exec } = require('child_process');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

responses = ["Scum.", "You violated the law. Pay the court a fine or serve your sentence. Your stolen goods are now forfeit.", "Say hello to my little friend", "It's time for just ice"]

const emotes = ["", "OwO", "UwU", "(・ω・)", ">w<", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
const enders = ["~", ":3", "X3", "", "~", "~", ""]

var damned = {}
var named = {}

function ToUSpeak(text) {
    text = text.toString();
    text = text.replace(/rl/g, '726C656E636F756E7465726564').replace(/lr/g, '6C72656E636F756E7465726564');
    text = text.replace(/l/g, 'w').replace(/r/g, 'w').replace(/\!/g, '!!1!1').replace(/\./g, enders[Math.floor(Math.random() * enders.length)] + ' .');
    text = text.replace(/726C656E636F756E7465726564/g, 'wl').replace(/6C72656E636F756E7465726564/g, 'wr');
    var words = text.match(/\S+/g) || [];
    var p1 = [];
    for (var i = 0; i < words.length; i++) {
        p1.push(words[i]);
        p1.push(emotes[Math.floor(Math.random() * emotes.length)]);
    }
    var out = p1.join(' ') + ' ';
    var out2 = out + enders[Math.floor(Math.random() * enders.length)];
    out2 = out2.replace(/  /g, ' ').replace(/~/g, '');
    out2 = out2.replace(/ua/g, 'uwa');
    return out2;
}

const uwuRegex = /([o0]\s*w\s*[o0]|u\s*w\s*u|[o0]\s*v\s*[o0]|[o0]\s*v\s*u|u\s*v\s*[o0]|[^a-zA-Z][o0]w[o0]|[^a-zA-Z]uwu|[^a-zA-Z][o0]v[o0]|[^a-zA-Z][o0]vu|[^a-zA-Z]uv[o0]|[^a-zA-Z][o0]wu|[^a-zA-Z]uw[o0]|O\s*w\s*U|U\s*w\s*O)/i;

var week

async function weekReset() {
    if (Math.floor((Math.floor((new Date() - new Date(now.getFullYear(), 0, 0)) / 1000 * 60 * 60 * 24)) / 7) != week) {
        week = Math.floor(day / 7)
        damned = {}
    }
}

async function asyncFuncs(message) {
    if (message.member.user.id == 735470118577897474 && message.content == "!JUSTRESET") {
        message.reply("Reseting...")
        named = {}
        damned = {}
        message.reply("Reset")
    }

    if (message.member.user.id == 735470118577897474 && message.content == "!JUSTUPDATE") {
        message.reply("Updating...")
        exec('git pull', (err, stdout, stderr) => {
            message.reply("Installed core.")
            if (err) {message.reply(stderr)}
            exec('npm install', (err, stdout, stderr) => {
                message.reply("Installed modules.")
                if (err) {message.reply(stderr)}
            });
        });
        message.reply("Updated. Restarting...")
        client.destroy()
        exit(0)
    }
}

client.on('messageCreate', async (message) => {
    weekReset()

    if (message.member.user.id == 1124068285051318445) {return;}

    asyncFuncs(message)

    func1 = (async () => {
        named[message.member.user.id] += message.content
    })()

    func2 = (async () => {
        if (damned[message.member.id] == 3 || (Math.floor((new Date() - new Date(now.getFullYear(), 0, 0)) / 1000 * 60 * 60 * 24) == 91)) {
            let tosend = message.member.user.username + "> " + ToUSpeak(message.content)
            for (let i = 0; i < message.attachments.array().length; i++) {
                tosend += " " + message.attachments.array()[i].url
            };
            message.delete()
            message.channel.send(tosend)
            return true
        } else {
            return false
        }
    })()

    if (!(await func2)) {
        if (uwuRegex.test(named[message.member.user.id])) {
            await func1
            if (damned[message.member.id] == undefined) {
                damned[message.member.id] = 0
            }
            message.reply(responses[damned[message.member.id]]);
            damned[message.member.id] += 1
            named[message.member.user.id] = named[message.member.user.id].substring(named[message.member.user.id].length - 100);
        }
    }
    

});

client.login(token);

// https://discord.com/oauth2/authorize?client_id=1124068285051318445&permissions=277293837376&scope=bot+messages.read+guilds+guilds.members.read