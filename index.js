const Discord = require("discord.js");
const config = require("./config.json");
const networks = require("@polkadot/networks")
const { randomAsU8a } = require('@polkadot/util-crypto');
const { signatureVerify,mnemonicGenerate, mnemonicToMiniSecret, randomAsHex } = require('@polkadot/util-crypto');
const { stringToU8a, u8aToHex } = require('@polkadot/util') ;
const { ApiPromise, WsProvider } = require('@polkadot/api');
//img 
const AUTHOR = "@aleadorjan";
const IMG_POLKA = 'https://i.imgur.com/E1bgyRO.png';
const IMG_POLKA_WHITE = 'https://i.imgur.com/XFV02Qh.png'
const IMG_AUTHOR = 'https://i.imgur.com/wSTFkRM.png'

const LINK_AUTHOR = 'https://discord.js.org'
const EMBED_COLOR_PRIMARY = 0xE6007A; 
const EMBED_COLOR_SECONDARY = 0x545454;
//wss URL of Provider
const PROVIDER = 'wss://westend-rpc.polkadot.io'
const PROVIDER_NAME = 'WestEnd'
const client = new Discord.Client();

const prefix = "!";
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


client.on("message", async function(message) {

  const provider = new WsProvider(PROVIDER);
  const api = await ApiPromise.create({ provider });
 
  if (!message.content.startsWith(prefix)) return;

  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    const timeTaken = Date.now() - message.createdTimestamp;
    message.reply(`Latency ${timeTaken}ms.`);
  }
  if (command === "block") {
    const headerBlock = await api.rpc.chain.subscribeNewHeads((header) => {
      const exampleEmbed = new Discord.MessageEmbed()
        .setColor(EMBED_COLOR_PRIMARY)
        .setTitle('Block')
        .setURL('https://wiki.polkadot.network/docs/en/glossary#block')
        .setAuthor(AUTHOR, IMG_POLKA_WHITE , LINK_AUTHOR)
        .setDescription('A collection of data, such as transactions, that together indicates a state transition of the blockchain.')
        .setThumbnail(IMG_POLKA)
        .addFields(
          { name: 'Chain block: #', value: `${header.number}` },
          { name: 'Parent hash: #', value: `${header.parentHash}` },
          { name: 'State root: #', value: `${header.stateRoot}` },
          { name: 'Extrinsic root: #', value: `${header.stateRoot}` },
        )
        //.addField('Inline field title', 'Some value here', true)
        .setImage(IMG_POLKA_WHITE)
        .setTimestamp()
        .setFooter('Network' + PROVIDER_NAME, IMG_POLKA);
      message.channel.send(exampleEmbed);
      //message.reply(`Chain block: #${header.number}`);
    });
    headerBlock()
  }
});

client.login(config.BOT_TOKEN);