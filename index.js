const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, ActivityType, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, time } = require('discord.js');
const { token, power } = require('./config.json');
const { exec } = require('child_process');
const { createClient } = require("redis")
var rand = require('random-seed').create();
var WebSocketClient = require('websocket').client;
var child_process = require('child_process');

// TODO


// V2

// Add real moderation       (Done)
// Use real slash commands   (Done)
// F to C translator         (Done)


// V3

// Start Sharding
// Increase throughput
// Verify bot on discord
// Set automod out of beta

// Init Database & RPC

const db = createClient();
db.on('error', err => console.log('Redis Client Error', err));

// console.log("Starting AI RPC Server")
// var rpc_proc = child_process.spawn("python3", ["rpc.py"], {stdio: 'inherit'});
var rpc_client = new WebSocketClient();

// Constants

const COMMAND_SPEC = "3.1"
const responses = [
    "Scum.",
    "You violated the law. Pay the court a fine or serve your sentence. Your stolen goods are now forfeit.",
    "Say hello to my little friend.",
    "If you want to use that language go to <https://reddit.com/r/furry>.",
    "Cease.",
    "Stop.",
    "<https://www.youtube.com/watch?v=dQw4w9WgXcQ>",
    "Engage in a moment of self-reflection.",
    "Your actions have consequences, remember that.",
    "I sense a disturbance in the digital realm.",
    "Consider the path you are treading carefully.",
    "Your words carry weight, choose them wisely.",
    "A wise person once said nothing at all.",
    "In a world of ones and zeros, be something more.",
    "Your uniqueness is wrong; Stop.",
    "Don't make me repeat myself. Cut it out!",
    "Hold it right there, partner.",
    "You're treading on dangerous ground, my friend.",
    "Let's keep it civil and respectful, shall we?",
    "I believe a calm and rational conversation would be more productive.",
    "I'd suggest you reconsider your actions. They might have consequences you don't want to face."
]
const emotes = ["", "OwO", "UwU", "(・ω・)", ">w<", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]
const enders = ["~", ":3", "X3", "", "~", "~", ""]
const uwuRegex = /(?<![a-zA-Z0-9])([o0Qθ○]\s*w\s*[o0Qθ○]|u\s*w\s*u|[o0Qθ○]\s*v\s*[o0Qθ○]|[o0Qθ○]\s*v\s*u|u\s*v\s*[o0Qθ○]|[^a-zA-Z][o0Qθ○]w[o0Qθ○]|[^a-zA-Z]uwu|[^a-zA-Z][o0Qθ○]v[o0Qθ○]|[^a-zA-Z][o0Qθ○]vu|[^a-zA-Z]uv[o0Qθ○]|[^a-zA-Z][o0Qθ○]wu|[^a-zA-Z]uw[o0Qθ○]|O\s*w\s*U|U\s*w\s*O)(?![a-z])/i;


// Variables

var validationQueue = []
var damned = {}
var named = {}
var week
var processed = 0

var voted = {}


// Helper Functions

function ToUSpeak(text) {
    text = text.toString().toLowerCase();
    text = text.replace(/rl/g, '726C656E636F756E7465726564').replace(/lr/g, '6C72656E636F756E7465726564');
    text = text.replace(/l/g, 'w').replace(/r/g, 'w').replace(/\!/g, '!!1!1').replace(/\./g, enders[rand(enders.length)] + ' .');
    text = text.replace(/726C656E636F756E7465726564/g, 'wl').replace(/6C72656E636F756E7465726564/g, 'wr');
    var words = text.match(/\S+/g) || [];
    var p1 = [];
    for (var i = 0; i < words.length; i++) {
        p1.push(words[i]);
        p1.push(emotes[rand(emotes.length)]);
    }
    var out = p1.join(' ') + ' ';
    var out2 = out + enders[rand(enders.length)];
    out2 = out2.replace(/  /g, ' ').replace(/~/g, '');
    out2 = out2.replace(/ua/g, 'uwa');
    return out2;
}

async function set(key, value) {
    await db.set(key.join(":"), JSON.stringify(value))
}

async function get(key) {
    return JSON.parse(await db.get(key.join(":")))
}

// RPC


rpc_client.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
});

rpc_client.on('connect', function (connection) {
    console.log('AI RPC Connected');
    connection.on('error', function (error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function () {
        console.log('AI RPC Connection Closed');
    });
    connection.on('message', async function (message) {
        if (message.type === 'utf8') {
            nmesg = JSON.parse(message.utf8Data)
            for (var i = 0; i < nmesg.length; i++) {
                let msg = validationQueue.shift()

                if (msg.request != undefined) {
                    await msg.interaction.editReply("'" + msg.content + "' has been detected of having a " + Math.floor((nmesg[i][0] * 100)) + "% chance of being hate speech", { "ephemeral": true })
                    continue
                }


                server = msg.guild.id

                thr = (await get(["justice", server, "automodc"]))

                if (thr == undefined) {
                    thr = 75
                }

                if (thr <= nmesg[i][0] * 100) {
                    msg.author.send("Any form of hate speech is not allowed, your message '" + msg.content + "' has been detected of having a " + Math.floor((nmesg[i][0] * 100)) + "% chance of being hate speech and has been automatically removed")
                    setTimeout(() => {
                        msg.delete()
                    }, 1000);
                }



            }
        }
    });

    setInterval(() => {
        if (validationQueue.length > 0) {
            // tosend = []
            // for (var i = 0; i < validationQueue.length; i++) {
            //     tosend.push(validationQueue[i].content)
            // }
            // connection.send(JSON.stringify(tosend))

            validationQueue = []
        }
    }, 5000);
});


// Commands

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages] });
const JOff = { name: 'off', description: 'Disables justice on this server', default_member_permissions: PermissionFlagsBits.ManageChannels, "type": 1 };
const JOn = { name: 'on', description: 'Enables justice on this server', default_member_permissions: PermissionFlagsBits.ManageChannels, "type": 1 }
const JWhite = { name: 'whitelist', description: 'Set justice enabled channels to only specified ones', default_member_permissions: PermissionFlagsBits.ManageChannels, "type": 1 }
const JBlack = { name: 'blacklist', description: 'Set justice enabled channels to all except specified ones', default_member_permissions: PermissionFlagsBits.ManageChannels, "type": 1 }
const JGlobal = { name: 'global', description: 'Set justice enabled channels to all ones', default_member_permissions: PermissionFlagsBits.ManageChannels, "type": 1 }
const JAdd = { name: 'add', description: 'Adds the current channel to the whitelist / blacklist', default_member_permissions: PermissionFlagsBits.ManageChannels, "type": 1 }
const JRemove = { name: 'remove', description: 'Removes the current channel from the whitelist / blacklist', default_member_permissions: PermissionFlagsBits.ManageChannels, "type": 1 }
const JList = { name: 'list', description: 'Lists the current whitelist / blacklist', default_member_permissions: PermissionFlagsBits.ManageChannels, "type": 1 }
const Justice = { name: 'help', description: 'Shows the help', default_member_permissions: PermissionFlagsBits.ManageChannels, "type": 1 }
const JPrivacy = { name: 'privacy', description: 'Shows the privacy policy', default_member_permissions: PermissionFlagsBits.ViewChannel, "type": 1 }
const JTos = { name: 'tos', description: 'Shows the tos', default_member_permissions: PermissionFlagsBits.ViewChannel, "type": 1 }

const JVote = {
    name: 'vote', description: 'Calls a vote', default_member_permissions: PermissionFlagsBits.ViewChannel, "type": 1, options: [
        {
            "name": "question",
            "description": "What are you voting apon?",
            "type": 3,
            "required": true,
        }
    ]
}

const Beta = {
    name: 'beta', description: 'Beta Features, use at your own demise', default_member_permissions: PermissionFlagsBits.ManageChannels, "type": 2, options: [
        {
            name: "modon",
            description: "Expirmatal AI Moderation Tool",
            type: 1
        },
        {
            name: "modoff",
            description: "Expirmatal AI Moderation Tool",
            type: 1
        },
        {
            name: 'modt', description: 'Set AI confidence required for action', default_member_permissions: PermissionFlagsBits.ManageChannels, "type": 1, options: [
                {
                    "name": "confidence",
                    "description": "Minimum percentage confidence",
                    "type": 4,
                    "required": true,
                }
            ]
        },
        {
            name: 'getmodreport', description: 'Get the estimated chance of being flagged', default_member_permissions: PermissionFlagsBits.ManageChannels, "type": 1, options: [
                {
                    "name": "message",
                    "description": "Message to check",
                    "type": 3,
                    "required": true,
                }
            ]
        }
    ]
}

mainCommand = {
    "name": "justice",
    "description": "Interface with justice",
    "required": true,
    "options": [
        JOff,
        JOn,
        JWhite,
        JBlack,
        JGlobal,
        JAdd,
        JRemove,
        JList,
        Justice,
        JPrivacy,
        JTos,
        Beta,
        JVote
    ]
}

// Client Processes

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    client.guilds.cache.forEach(async (guild) => {
        ret = await db.get("JusticeGuild:" + guild.id)
        if (ret != ("true" + COMMAND_SPEC)) {
            guild.commands.set([])
            setTimeout(async () => {
                await guild.commands.create(mainCommand);
            }, 1000);
            db.set("JusticeGuild:" + guild.id, "true" + COMMAND_SPEC)
        }
    });
    client.user.setPresence({
        activities: [{ name: `for evil`, type: ActivityType.Watching }],
    });
});



// Embeds

const help = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('Justice Command Help')
    .addFields(
        { name: '/justice off', value: 'Disables justice on this server' },
        { name: '/justice on', value: 'Enables justice on this server' },
        { name: '/justice whitelist', value: 'Set justice enabled channels to only specified ones' },
        { name: '/justice blacklist', value: 'Set justice enabled channels to all except specified ones' },
        { name: '/justice global', value: 'Set justice enabled channels to all ones' },
        { name: '/justice add', value: 'Adds the current channel to the whitelist / blacklist' },
        { name: '/justice remove', value: 'Removes the current channel from the whitelist / blacklist' },
        { name: '/justice list', value: 'Lists the current whitelist / blacklist' },
        { name: '/justice privacy', value: 'Shows the privacy policy' },
        { name: '/justice tos', value: 'Shows the tos' },
    )


const privacy = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('Justice Privacy Policy')
    .addFields(
        { name: 'Effective Date:', value: '08/08/2023' },
        { name: '\n', value: 'This Privacy Policy explains how Just-Ice ("we", "us", or "our") collects, uses, and discloses personal information obtained from users ("you" or "your") through the use of Just-ice. By using Just-ice, you consent to the practices described in this Privacy Policy.' },
        { name: 'Information We Collect:', value: 'We may collect and store certain information provided by you or obtained automatically through the Discord platform, such as your Discord username, user ID, Discord server and channel names and IDs and the first 100 characters of your messages' },
        { name: 'How We Use Your Information:', value: 'We use your information for identifying and responding to specific keywords or triggers. Your information will never leave our servers and will be deleted after 24 hours.' },
        { name: 'Data Sharing and Disclosure:', value: 'We do not sell or share your personal information with third parties.' },
        { name: 'Security:', value: 'All personal information will be communicated over encrypted and secure channels.' },
        { name: 'Your Choices:', value: 'You can control the information you provide through your interactions with our bot. You may also have rights under applicable data protection laws. To opt out of data collection you must contact the server administrator or leave the server or channel you know the bot is active in.' },
        { name: 'Changes to This Policy:', value: 'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the revised policy on our bot.' },
        { name: 'Contact Us:', value: 'If you have any questions or concerns about our Privacy Policy, please contact us at support@jkinc.co.uk' },
    )

const tos = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('Justice Terms Of Service')
    .addFields(
        { name: 'By using Just-Ice, you agree to comply with these terms:', value: '\n' },
        { name: 'Usage Restrictions:', value: 'You may use the bot only in accordance with its intended purposes and within the limits of the law and Discord\'s terms of service.' },
        { name: 'User Conduct:', value: 'You must not use the bot to engage in any unlawful, abusive, or disruptive behavior, including but not limited to spamming, harassment, or distribution of malicious content.' },
        { name: 'Privacy:', value: 'You acknowledge and agree that the bot may collect and store certain personal information as described in our Privacy Policy.' },
        { name: 'No Warranty:', value: 'The bot is provided "as is" without any warranty. We do not guarantee its availability, accuracy, or reliability.' },
        { name: 'Limitation of Liability:', value: 'We shall not be liable for any indirect, incidental, consequential, or punitive damages arising out of your use of the bot.' },
        { name: 'Modification and Termination:', value: 'We reserve the right to modify or terminate the bot at any time without notice. We may also suspend or terminate your access to the bot if you violate these terms.' },
        { name: 'Governing Law:', value: 'These terms shall be governed by and construed in accordance with the courts of England and Wales.' },
        { name: 'Contact Information:', value: 'If you have any questions or concerns about these terms, please contact us at support@jkinc.co.uk' },
    )

// Message Handling

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
                    rpc_proc.kill()
                    client.destroy()
                    process.exit()
                }, 5000);
            });
        });
    }

    if (message.member.user.id == power && message.content == "!JUSTUPDATELATER") {
        var midnight = new Date();
        midnight.setHours(24);
        midnight.setMinutes(0);
        midnight.setSeconds(0);
        midnight.setMilliseconds(0);
        message.reply("Updating in " + (Math.floor((midnight.getTime() - new Date().getTime()) / 1000 / 60 / 60)) + " hours and " + (Math.floor(((midnight.getTime() - new Date().getTime()) / 1000 / 60) % 60)) + " minutes.")
        setTimeout(async () => {
            message.reply("Updating...")
            exec('git reset --hard HEAD & git pull', (err, stdout, stderr) => {
                message.reply("Installed core.")
                if (err) { message.reply(stderr) }
                exec('npm install', (err, stdout, stderr) => {
                    message.reply("Installed modules.")
                    if (err) { message.reply(stderr) }
                    message.reply("Updated. Restarting...")
                    setTimeout(() => {
                        rpc_proc.kill()
                        client.destroy()
                        process.exit()
                    }, 5000);
                });
            });
        }, (midnight.getTime() - new Date().getTime()))
    }

    if (message.member.user.id == power && message.content.split(" ")[0] == "!JUSTRELEASE") {
        damned[message.content.split(" ")[1]] = 0
        message.reply("They have been pardoned")
    }

    if (message.member.user.id == power && message.content.split(" ")[0] == "!JUSTCURSE") {
        message.reply("They have been cursed")
        damned[message.content.split(" ")[1]] = 3
    }

}

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        let id = interaction.customId.split("-")
        let vote = await get(["justice", "votes", id[1]])
        if (vote != undefined) {
            if (id[0] == "refresh") {
                let embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(vote["question"])
                    .addFields(
                        { name: '@' + vote["author"].username + " Has called a vote!", value: " " },
                        { name: 'Votes:', value: (vote["votes"]["no"] + vote["votes"]["yes"] + vote["votes"]["abstain"]).toString() },
                        { name: '\u200B', value: '\u200B' },
                        { name: 'Yes:', value: (vote["votes"]["yes"]).toString() },
                        { name: 'No:', value: (vote["votes"]["no"]).toString() },
                        { name: 'Abstain:', value: (vote["votes"]["abstain"]).toString() },
                        { name: '\u200B', value: '\u200B' },
                        { name: 'Vote ends', value: time(vote["ends"], "R") },
                    )

                let buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('yes-' + id[1])
                            .setLabel('Yes')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('no-' + id[1])
                            .setLabel('No')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('abstain-' + id[1])
                            .setLabel('Abstain')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('refresh-' + id[1])
                            .setLabel('Refresh')
                            .setStyle(ButtonStyle.Secondary),
                    )

                msg = await interaction.channel.messages.fetch(vote["msg"]["id"])
                msg.edit({ embeds: [embed], components: [buttons] })
                interaction.reply({ content: "Refreshed", ephemeral: true })
                return
            }

            if (interaction.user.id in vote["voted"]) {
                interaction.reply({ content: "You have already voted.", ephemeral: true })
            } else {
                vote["voted"][interaction.user.id] = 1
                vote["votes"][id[0]] += 1

                let embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(vote["question"])
                    .addFields(
                        { name: '@' + vote["author"].username + " Has called a vote!", value: " " },
                        { name: 'Votes:', value: (vote["votes"]["no"] + vote["votes"]["yes"] + vote["votes"]["abstain"]).toString() },
                        { name: '\u200B', value: '\u200B' },
                        { name: 'Yes:', value: (vote["votes"]["yes"]).toString() },
                        { name: 'No:', value: (vote["votes"]["no"]).toString() },
                        { name: 'Abstain:', value: (vote["votes"]["abstain"]).toString() },
                        { name: '\u200B', value: '\u200B' },
                        { name: 'Vote ends', value: time(vote["ends"], "R") },
                    )

                let buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('yes-' + id[1])
                            .setLabel('Yes')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('no-' + id[1])
                            .setLabel('No')
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId('abstain-' + id[1])
                            .setLabel('Abstain')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('refresh-' + id[1])
                            .setLabel('Refresh')
                            .setStyle(ButtonStyle.Secondary),
                    )

                msg = await interaction.channel.messages.fetch(vote["msg"]["id"])
                msg.edit({ embeds: [embed], components: [buttons] })

                set(["justice", "votes", id[1]], vote)

                interaction.reply({ content: "Vote cast.", ephemeral: true })
            }


        } else {
            interaction.reply({ content: "This vote doesn't exist.", ephemeral: true })
        }
        return;

    }

    if (!interaction.isCommand()) return;

    if (interaction.commandName != "justice") { return; }

    sub = interaction.options.getSubcommand()
    subGroup = interaction.options.getSubcommandGroup()

    server = interaction.guild.id

    if (sub === 'on') {
        set(["justice", server, "stat"], true)
        await interaction.reply({ content: "Justice enabled", ephemeral: true });
    } else if (sub === 'off') {
        set(["justice", server, "stat"], false)
        await interaction.reply({ content: "Justice disabled", ephemeral: true })
    } else if (sub === 'whitelist') {
        set(["justice", server, "list"], "w")
        await interaction.reply({ content: "Justice whitelist enabled", ephemeral: true })
    } else if (sub === 'blacklist') {
        set(["justice", server, "list"], "b")
        await interaction.reply({ content: "Justice blacklist enabled", ephemeral: true })
    } else if (sub === 'global') {
        set(["justice", server, "list"], "g")
        await interaction.reply({ content: "Justice globally enabled", ephemeral: true })
    } else if (sub === 'add') {
        x = await get(["justice", server, "listc"])
        if (x == null) { x = [] }
        x.push(channel)
        set(["justice", server, "listc"], x)
        await interaction.reply({ content: "Channel added to list", ephemeral: true })
    } else if (sub === 'remove') {
        x = await get(["justice", server, "listc"])
        y = x.indexOf(channel)
        if (y > -1) {
            x.splice(y, 1);
        }
        set(["justice", server, "listc"], x)
        await interaction.reply({ content: "Channel removed from list", ephemeral: true })
    } else if (sub === 'help') {
        await interaction.reply({ embeds: [help], ephemeral: true })
    } else if (sub === "list") {
        let x = await get(["justice", server, "listc"])
        let y = await message.guild.channels.fetch(x)
        let z = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Justice Whitelist')

        for (let x = 0; x < y.array().length; x++) {
            z.addFields({ name: '', value: y.array()[x].name })
        }
        await interaction.reply({ embeds: [z], ephemeral: true })
    } else if (sub === "privacy") {
        await interaction.reply({ embeds: [privacy], ephemeral: true })
    } else if (sub === "tos") {
        await interaction.reply({ embeds: [tos], ephemeral: true })
    } else if (subGroup === "beta") {
        if (sub == "modon") {
            await interaction.reply({ content: "Justice Automod has been enabled, please be advised this is a beta feature and may not be fully functional.", ephemeral: true })
            set(["justice", server, "automod"], "true")
        } else if (sub == "modoff") {
            await interaction.reply({ content: "Justice Automod has been disabled.", ephemeral: true })
            set(["justice", server, "automod"], "false")
        } else if (sub == "modt") {
            let confidence = interaction.options.getInteger('confidence');
            await interaction.reply({ content: "Setting AI confidence to " + confidence + "%", ephemeral: true })
            set(["justice", server, "automodc"], confidence)
        } else if (sub == "getmodreport") {
            let msg = interaction.options.getString('message');
            await interaction.deferReply();
            validationQueue.push({
                "content": msg,
                "request": true,
                "interaction": interaction
            })
        }
    } else if (sub === "vote") {
        let topic = interaction.options.getString('question');
        interaction.reply({ content: "Vote started", ephemeral: true })

        voteid = Math.floor(Math.random() * 10000000)

        let embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(topic)
            .addFields(
                { name: '@' + interaction.user.username + " Has called a vote!", value: " " },
                { name: 'Votes:', value: '0' },
                { name: '\u200B', value: '\u200B' },
                { name: 'Yes:', value: '0' },
                { name: 'No:', value: '0' },
                { name: 'Abstain:', value: '0' },
                { name: '\u200B', value: '\u200B' },
                { name: 'Vote ends', value: time(Math.floor(Date.now() / 1000) + 3600, "R") },
            )

        let buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('yes-' + voteid)
                    .setLabel('Yes')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('no-' + voteid)
                    .setLabel('No')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('abstain-' + voteid)
                    .setLabel('Abstain')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('refresh-' + voteid)
                    .setLabel('Refresh')
                    .setStyle(ButtonStyle.Secondary),
            )

        msg = await interaction.channel.send({ embeds: [embed], components: [buttons] })



        await set(["justice", "votes", voteid], {
            votes: {
                yes: 0,
                no: 0,
                abstain: 0
            },
            voted: {},
            msg: msg,
            id: voteid,
            channel: interaction.channel,
            author: interaction.user,
            question: topic,
            ends: Math.floor(Date.now() / 1000) + 3600
        })

    }

});

// Remove old votes
setInterval(async () => {
    for await (const key of db.scanIterator({ MATCH: 'justice:votes:*' })) {
        // use the key!
        vote = JSON.parse(await db.get(key))
        if (vote != undefined) {
            if (vote["ends"] < Math.floor(Date.now() / 1000)) {
                let embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle(vote["question"])
                    .addFields(
                        { name: '@' + vote["author"].username + " Has called a vote!", value: " " },
                        { name: 'Votes:', value: (vote["votes"]["no"] + vote["votes"]["yes"] + vote["votes"]["abstain"]).toString() },
                        { name: '\u200B', value: '\u200B' },
                        { name: 'Yes:', value: (vote["votes"]["yes"]).toString() },
                        { name: 'No:', value: (vote["votes"]["no"]).toString() },
                        { name: 'Abstain:', value: (vote["votes"]["abstain"]).toString() },
                        { name: '\u200B', value: '\u200B' },
                        { name: 'Vote ended.', value: time(vote["ends"], "R") },
                    )

                    id = vote["id"]

                    let buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('yes-' + id)
                            .setLabel('Yes')
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('no-' + id)
                            .setLabel('No')
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('abstain-' + id)
                            .setLabel('Abstain')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('refresh-' + id)
                            .setLabel('Refresh')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true),
                    )

                msg = await (await client.channels.resolve(vote["channel"]["id"])).messages.fetch(vote["msg"]["id"])
                msg.edit({ embeds: [embed], components: [] })

                msg.reply("Vote ended. " + vote["question"] + " was called : " + ((vote["votes"]["yes"] == vote["votes"]["no"] || vote["votes"]["abstain"] > (vote["votes"]["no"] + vote["votes"]["yes"])) ? "abstained " : (vote["votes"]["yes"] > vote["votes"]["no"] ? "Yes" : "No")) + ".")

                vote = {}
                db.set(key, JSON.stringify(vote))
            }
        }
    }

}, 5000);

async function processMessage(message) {
    if (message.member.user.id == 1124068285051318445) { return; }
    if (message.guild == null) { return }

    asyncFuncs(message)

    server = message.guild.id
    shouldrun = (await get(["justice", server, "stat"]))
    if (shouldrun != undefined && !shouldrun) { return }
    channel = message.channel.id
    lst = await get(["justice", server, "listc"])
    list = await get(["justice", server, "list"])
    if (lst == null) { lst = [] }
    if (list == null) { list = "g" }
    if ((lst.includes(channel)) && (list == "b")) { return }
    if (!(lst.includes(channel)) && (list == "w")) { return }

    if ((await get(["justice", server, "automod"])) == "true") {
        validationQueue.push(message)
    }


    func1 = (async () => {
        if (named[message.member.user.id] == undefined) {
            named[message.member.user.id] = " " + message.content
        } else {
            named[message.member.user.id] += (" " + message.content)
        }

    })();

    (async () => {
        regex = /\s+[0-9.-]*\s*(?:(?:°|degrees)\s*f\s*|(?:°|degrees)\s*F\s*|f\s+|F\s+|fahrenheit)/gmi;
        content = " " + message.content + " "
        temps = [...content.matchAll(regex)];
        toreply = ""
        for (let i = 0; i < temps.length; i++) {
            num = temps[i][0].replace(/[^[0-9.-]]*/g, "")
            if (num == "") { continue }
            numc = Math.round(((num - 32) / (9 / 5)) * 10) / 10
            if (num == NaN) { continue }
            toreply += (num + "°F is " + numc + "°C\n")
        }
        if (toreply != "") { message.reply(toreply) }
    })();

    func2 = (async () => {
        if (damned[message.member.id] == 3) {
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
            if (rand(1000) == 69) {
                message.reply("Commit Die");
            } else {
                message.reply(responses[Math.floor(rand((responses.length)))]);
            }

            damned[message.member.id] += 1

            if (damned[message.member.id] == 3) {
                setTimeout(() => {
                    damned[message.member.id] = 0
                }, 1000 * 60 * 60 * 24);
            }

            named[message.member.user.id] = named[message.member.user.id].substring(named[message.member.user.id].length - 100);
        }


        if (new Date().getMonth() == 3 && new Date().getDate() == 1 && /[qQ]/gm.test(named[message.member.user.id])) {
            await func1
            named[message.member.user.id] = ""
            if (damned[message.member.id] == undefined) {
                damned[message.member.id] = 0
            }

            if (rand(5) == 2) {
                message.reply("No more `q`");
            }
            else if (rand(1000) == 69) {
                message.reply("Commit Die");
            } else {
                message.reply(responses[Math.floor(rand((responses.length)))]);
            }

            damned[message.member.id] += 1

            if (damned[message.member.id] == 3) {
                setTimeout(() => {
                    damned[message.member.id] = 0
                }, 1000 * 60 * 60 * 24);
            }

            named[message.member.user.id] = named[message.member.user.id].substring(named[message.member.user.id].length - 100);
        }
    }

    processed += 1
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) { return }

    // message.guild.me.timeout(null)
    await processMessage(message)
});

client.on("guildCreate", async (guild) => {
    await guild.commands.create(mainCommand);

    db.set("JusticeGuild:" + guild.id, "true" + COMMAND_SPEC)
})

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (oldMessage.content == newMessage.content) { return }
    await processMessage(newMessage)
});

// Startup

(async () => {
    await db.connect();
    // setTimeout(() => {
    //     rpc_client.connect('ws://localhost:8765');
    // }, 30000);
    client.login(token);
})()

setInterval(() => {
    console.log("Processed: " + processed + " messages per second")
    processed = 0
}, 60000);


// https://discord.com/oauth2/authorize?client_id=1124068285051318445&permissions=277293837376&scope=bot+messages.read+guilds+guilds.members.read
