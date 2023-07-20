const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');
const { token, power } = require('./config.json');
const { exec } = require('child_process');
const { createClient } = require("redis")

const db = createClient();

db.on('error', err => console.log('Redis Client Error', err));

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
    text = text.toString().toLowerCase();
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

const uwuRegex = /(?<![a-z])([o0]\s*w\s*[o0]|u\s*w\s*u|[o0]\s*v\s*[o0]|[o0]\s*v\s*u|u\s*v\s*[o0]|[^a-zA-Z][o0]w[o0]|[^a-zA-Z]uwu|[^a-zA-Z][o0]v[o0]|[^a-zA-Z][o0]vu|[^a-zA-Z]uv[o0]|[^a-zA-Z][o0]wu|[^a-zA-Z]uw[o0]|O\s*w\s*U|U\s*w\s*O)(?![a-z])/i;

var week

async function set(key, value) {
    await db.set(key.join(":"), JSON.stringify(value))
}

async function get(key) {
    return JSON.parse(await db.get(key.join(":")))

}

const help = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('Justice Command Help')
    .addFields(
        { name: '!justice off', value: 'Disables justice on this server' },
        { name: '!justice on', value: 'Enables justice on this server' },
        { name: '!justice whitelist', value: 'Set justice enabled channels to only specified ones' },
        { name: '!justice blacklist', value: 'Set justice enabled channels to all except specified ones' },
        { name: '!justice global', value: 'Set justice enabled channels to all ones' },
        { name: '!justice add', value: 'Adds the current channel to the whitelist / blacklist' },
        { name: '!justice remove', value: 'Removes the current channel from the whitelist / blacklist' },
        { name: '!justice list', value: 'Lists the current whitelist / blacklist' },
    )

async function asyncFuncs(message) {
    if (message.member.user.id == power && message.content == "!JUSTRESET") {
        message.reply("Reseting...")
        named = {}
        damned = {}
        message.reply("Reset")
    }

    if (message.member.user.id == power && message.content == "!JUSTUPDATE") {
        message.reply("Updating...")
        exec('git reset --hard HEAD & git pull', (err, stdout, stderr) => {
            message.reply("Installed core.")
            if (err) { message.reply(stderr) }
            exec('npm install', (err, stdout, stderr) => {
                message.reply("Installed modules.")
                if (err) { message.reply(stderr) }
                message.reply("Updated. Restarting...")
                setTimeout(() => {
                    client.destroy()
                    process.exit()
                }, 5000);
            });
        });

    }

    if (message.member.user.id == power && message.content.split(" ")[0] == "!JUSTRELEASE") {
        damned[message.content.split(" ")[1]] = 0
    }



    if (message.member.permissions.has(PermissionsBitField.Flags.Administrator) && message.content.toLowerCase().split(" ")[0] == "!justice") {
        server = message.guild.id
        channel = message.channel.id
        if (message.content.toLowerCase().split(" ")[1] == "on") {
            set(["justice", server, "stat"], true)
            message.reply({ content: "Justice enabled", ephemeral: true })
        } else if (message.content.toLowerCase().split(" ")[1] == "off") {
            set(["justice", server, "stat"], false)
            message.reply({ content: "Justice disabled", ephemeral: true })
        } else if (message.content.toLowerCase().split(" ")[1] == "whitelist") {
            set(["justice", server, "list"], "w")
            message.reply({ content: "Justice whitelist enabled", ephemeral: true })
        } else if (message.content.toLowerCase().split(" ")[1] == "blacklist") {
            set(["justice", server, "list"], "b")
            message.reply({ content: "Justice blacklist enabled", ephemeral: true })
        } else if (message.content.toLowerCase().split(" ")[1] == "global") {
            set(["justice", server, "list"], "g")
            message.reply({ content: "Justice globally enabled", ephemeral: true })
        } else if (message.content.toLowerCase().split(" ")[1] == "add") {
            x = await get(["justice", server, "listc"])
            if (x == null) { x = [] }
            x.push(channel)
            set(["justice", server, "listc"], x)
            message.reply({ content: "Channel added to list", ephemeral: true })
        } else if (message.content.toLowerCase().split(" ")[1] == "remove") {
            x = await get(["justice", server, "listc"])
            y = x.indexOf(channel)
            if (y > -1) {
                x.splice(y, 1);
            }
            set(["justice", server, "listc"], x)
            message.reply({ content: "Channel removed from list", ephemeral: true })
        } else if (message.content.toLowerCase().split(" ")[1] == "list") {
            let x = await get(["justice", server, "listc"])
            let y = await message.guild.channels.fetch(x)
            let z = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Justice Whitelist')

            for (let x = 0; x < y.array().length; x++) {
                z.addFields({ name: '', value: y.array()[x].name })
            }
            message.reply({ embeds: [z], ephemeral: true })
        } else {
            message.reply({ embeds: [help], ephemeral: true })
        }
    }

}

async function processMessage(message) {
    if (message.member.user.id == 1124068285051318445) { return; }
    if (message.guild == null) { return }

    asyncFuncs(message)

    server = message.guild.id
    if (!(await get(["justice", server, "stat"]))) { return }
    channel = message.channel.id
    lst = await get(["justice", server, "listc"])
    list = await get(["justice", server, "list"])
    if (lst == null) { lst = [] }
    if (list == null) { list = "g" }
    if ((lst.includes(channel)) && (list == "b")) { return }
    if (!(lst.includes(channel)) && (list == "w")) { return }


    func1 = (async () => {
        if (named[message.member.user.id] == undefined) {
            named[message.member.user.id] = " " + message.content
        } else {
            named[message.member.user.id] += (" " + message.content)
        }

    })()

    func2 = (async () => {
        if (damned[message.member.id] == 3 || (Math.floor((new Date() - new Date((new Date()).getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)) == 91)) {
            get_lnk = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/ig
            links = [...message.content.matchAll(get_lnk)]
            xx = message.content
            xx.replace(/\@everyone/gi, "")
            xx.replace(/\@here/gi, "")
            for (let i = 0; i < links.length; i++) {
                xx.replace(links[i][0], "596f75204c696b65204a617a7aX")
            }

            let tosend = ToUSpeak(xx)
            for (let i = 0; i < message.attachments.length; i++) {
                tosend += " " + message.attachments[i].url
            };
            for (let i = 0; i < links.length; i++) {
                xx.replace(/596f75204c696b65204a617a7aX/, links[i][0])
            }
            message.delete()
            message2 = {
                type: "rich",
                title: "",
                description: tosend,
                color: 0x36393f,
                author: {
                    name: message.member.user.username,
                    icon_url: message.member.user.avatarURL()
                }
            }
            message.channel.send({ embeds: [message2] })
            return true
        } else {
            return false
        }
    })()

    if (!(await func2)) {
        if (uwuRegex.test(named[message.member.user.id])) {
            await func1
            named[message.member.user.id] = ""
            if (damned[message.member.id] == undefined) {
                damned[message.member.id] = 0
            }
            message.reply(responses[damned[message.member.id]]);
            damned[message.member.id] += 1
            named[message.member.user.id] = named[message.member.user.id].substring(named[message.member.user.id].length - 100);
        }
    }
}

client.on('messageCreate', async (message) => {
    processMessage(message)
});

client.on('messageUpdate', (oldMessage, newMessage) => {
    processMessage(newMessage)
});

(async () => {
    await db.connect();
    client.login(token);
})()


// https://discord.com/oauth2/authorize?client_id=1124068285051318445&permissions=277293837376&scope=bot+messages.read+guilds+guilds.members.read