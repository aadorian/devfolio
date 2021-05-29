require("dotenv").config();

const Discord = require("discord.js");
const config = require("./config.json");
const networks = require("@polkadot/networks");
const { randomAsU8a } = require("@polkadot/util-crypto");
const {
  signatureVerify,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  randomAsHex,
} = require("@polkadot/util-crypto");
const { stringToU8a, u8aToHex } = require("@polkadot/util");
const { ApiPromise, WsProvider } = require("@polkadot/api");

//author
const AUTHOR = "@aleadorjan";
//img URL
const IMG_POLKA = "https://i.imgur.com/E1bgyRO.png";
const IMG_POLKA_WHITE = "https://i.imgur.com/XFV02Qh.png";
const IMG_AUTHOR = "https://i.imgur.com/wSTFkRM.png";

const LINK_AUTHOR = "https://discord.js.org";
//colors
const EMBED_COLOR_PRIMARY = 0xe6007a;
const EMBED_COLOR_SECONDARY = 0x545454;
//wss URL of Provider
const PROVIDER = "wss://westend-rpc.polkadot.io";
const PROVIDER_NAME = "WestEnd";
const TOKEN_NAME = "WND";
const client = new Discord.Client();

const prefix = "!";
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", async function (message) {
  const provider = new WsProvider(PROVIDER);
  const api = await ApiPromise.create({ provider });

  if (!message.content.startsWith(prefix)) return;

  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(" ");
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    const timeTaken = Date.now() - message.createdTimestamp;
    message.reply(`Latency ${timeTaken}ms.`);
  }
  if (command === "block") {
    const headerBlock = await api.rpc.chain.subscribeNewHeads((header) => {
      const blockEmbed = new Discord.MessageEmbed()
        .setColor(EMBED_COLOR_PRIMARY)
        .setTitle("Block")
        .setURL("https://wiki.polkadot.network/docs/en/glossary#block")
        .setAuthor(AUTHOR, IMG_POLKA_WHITE, LINK_AUTHOR)
        .setDescription(
          "A collection of data, such as transactions, that together indicates a state transition of the blockchain."
        )
        .setThumbnail(IMG_POLKA)
        .addFields(
          { name: "Chain block: #", value: `${header.number}` },
          { name: "Parent hash: #", value: `${header.parentHash}` },
          { name: "State root: #", value: `${header.stateRoot}` },
          { name: "Extrinsic root: #", value: `${header.stateRoot}` }
        )
        //.addField('Inline field title', 'Some value here', true)
        .setImage(IMG_POLKA_WHITE)
        .setTimestamp()
        .setFooter("Network: " + PROVIDER_NAME, IMG_POLKA);
      message.channel.send(blockEmbed);
      //message.reply(`Chain block: #${header.number}`);
    });
    headerBlock();
  }
  if (command === "account") {

    let {
      data: {
        free: previousFree,
        reserved: reserved,
        miscFrozen: miscFrozen,
        feeFrozen: feeFrozen,
      },
      nonce: previousNonce,
      consumers: consumers,
      sufficients: sufficients,
      providers: providers,
    } = await api.query.system.account(process.env.ACCOUNT_ALICE);
   
    const accountEmbed = new Discord.MessageEmbed()
      .setColor(EMBED_COLOR_PRIMARY)
      .setTitle("Account Balance")
      .setURL("https://wiki.polkadot.network/docs/en/learn-accounts")
      .setAuthor(AUTHOR, IMG_POLKA_WHITE, LINK_AUTHOR)
      .setDescription(
        'The "total" balance of the account is considered the amount of "free" funds in the account subtracted by any funds that are "reserved." Reserved funds are held due to on-chain requirements and can usually be freed by making some on-chain action. '
      )
      .setThumbnail(IMG_POLKA)

      .addFields(
        { name: "Account: ", value: `${process.env.ACCOUNT_ALICE} ` },
        { name: "Balance: ", value: `${previousFree} ` + TOKEN_NAME },
        { name: "Reserved: ", value: `${reserved} ` + TOKEN_NAME },
        { name: "Misc frozen: ", value: `${miscFrozen} ` + TOKEN_NAME },
        { name: "Fee frozen: ", value: `${feeFrozen} ` + TOKEN_NAME },
        { name: "Previous nonce: ", value: `${previousNonce} ` + TOKEN_NAME },
        { name: "Consumers: ", value: `${consumers} ` },
        { name: "Providers: ", value: `${providers} ` },
        //{ name: "Sufficients: ", value: `${sufficients} ` }
      )
     // .setImage(IMG_POLKA_WHITE)
      .setTimestamp()
      .setFooter("Network: " + PROVIDER_NAME, IMG_POLKA);
    message.channel.send(accountEmbed);

  }
  if (command === "blockchain"){
    const [chain, nodeName, nodeVersion,now] = await Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.name(),
      api.rpc.system.version(),
      api.query.timestamp.now()
    ]);
    const lastHeader = await api.rpc.chain.getHeader();
    //console.log(`${lastHeader}`);
    const blockChainEmbed = new Discord.MessageEmbed()
        .setColor(EMBED_COLOR_PRIMARY)
        .setTitle("Blockchain " + `${chain}`)
        .setURL("https://wiki.polkadot.network/docs/en/learn-architecture")
        .setAuthor(AUTHOR, IMG_POLKA_WHITE, LINK_AUTHOR)
        .setDescription(
          "The Relay Chain is the central chain of Polkadot. Westend is the latest test network for Polkadot. The tokens on this network are called Westies and they purposefully hold no economic value."
        )
        .setThumbnail(IMG_POLKA)
        .addFields(
          { name: "Chain: ", value: `${chain}` },
          { name: "Node Name: ", value: `${nodeName}` },
          { name: "Node Version: ", value: `${nodeVersion}` },
          { name: "Last Block: ", value: `${lastHeader.number}` },
          { name: "Parent Hash: ", value: `${lastHeader.parentHash}` },
          { name: "Last Hash: ", value: `${lastHeader.hash}` },
          { name: "stateRoot: ", value: `${lastHeader.stateRoot}` },
          { name: "Last Block TimeStamp: ", value: `${now.toNumber()}` },
        )
        //.addField('Inline field title', 'Some value here', true)
       // .setImage(IMG_POLKA_WHITE)
        .setTimestamp()
        .setFooter("Network: " + PROVIDER_NAME, IMG_POLKA);
      message.channel.send(blockChainEmbed);
      //message.reply(`Chain block: #${header.number}`);
  }
});

client.login(config.BOT_TOKEN);
