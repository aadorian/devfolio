const Discord = require("discord.js");
const config = require("./config.json");
const networks = require("@polkadot/networks")
const { randomAsU8a } = require('@polkadot/util-crypto');
const { signatureVerify,mnemonicGenerate, mnemonicToMiniSecret, randomAsHex } = require('@polkadot/util-crypto');
const { stringToU8a, u8aToHex } = require('@polkadot/util') ;
const { ApiPromise, WsProvider } = require('@polkadot/api');
//img 
const AUTHOR = "@aleadorjan";
const BLOCK = "https://i.imgur.com/R8ftZPS.png";
const EMBED_COLOR_PRIMARY = 0x8444e4; 
const EMBED_COLOR_SECONDARY = 0x545454;
//wss URL of Provider
const PROVIDER = 'wss://westend-rpc.polkadot.io'
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
      message.reply(`Chain block: #${header.number}`);
        
    });
    headerBlock()
  }


});

client.login(config.BOT_TOKEN);