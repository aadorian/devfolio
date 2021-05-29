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
        { name: "Providers: ", value: `${providers} ` }
        //{ name: "Sufficients: ", value: `${sufficients} ` }
      )
      // .setImage(IMG_POLKA_WHITE)
      .setTimestamp()
      .setFooter("Network: " + PROVIDER_NAME, IMG_POLKA);
    message.channel.send(accountEmbed);
  }
  if (command === "blockchain") {
    const [chain, nodeName, nodeVersion, now] = await Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.name(),
      api.rpc.system.version(),
      api.query.timestamp.now(),
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
        { name: "StateRoot: ", value: `${lastHeader.stateRoot}` },
        { name: "Last Block TimeStamp: ", value: `${now.toNumber()}` }
      )
      //.addField('Inline field title', 'Some value here', true)
      // .setImage(IMG_POLKA_WHITE)
      .setTimestamp()
      .setFooter("Network: " + PROVIDER_NAME, IMG_POLKA);
    message.channel.send(blockChainEmbed);
    //message.reply(`Chain block: #${header.number}`);
  }
  if (command === "validators") {
    const validators = await Promise.all([
      api.query.session.validators()
    ]);
    if (validators && validators.length > 0) {
      const validatorBalances = await Promise.all(
        validators.map((authorityId) =>
          api.query.system.account(authorityId)
        )
      );
      // Print out the authorityIds and balances of all validators
     
      let keys = Array.from(  validators.map((authorityId, index) => (
        {
        address: authorityId.toString(),
        balance: validatorBalances[index].data.free.toHuman(),
        nonce: validatorBalances[index].nonce.toHuman()
      })));
  
      const validatorsEmbed = new Discord.MessageEmbed()
      .setColor(EMBED_COLOR_PRIMARY)
      .setTitle("Validators " )
      .setURL("https://wiki.polkadot.network/docs/en/learn-validator#docsNav")
      .setAuthor(AUTHOR, IMG_POLKA_WHITE, LINK_AUTHOR)
      .setDescription(
        "Validators secure the Relay Chain by staking DOT, validating proofs from collators and participating in consensus with other validators. These participants will play a crucial role in adding new blocks to the Relay Chain and, by extension, to all parachains. This allows parties to complete cross-chain transactions via the Relay Chain."
      )
      .setThumbnail(IMG_POLKA)
      .addFields(
  
        { name: 'Validators #', value: keys.length, inline: false },
       // { name: 'Info', value: JSON.stringify(keys), inline: true },
       //TODO: extend to list of validators from other networks
       { name: 'Address', value: `${keys[0].address}` , inline: true },
       { name: 'Balance', value: `${keys[0].balance}` , inline: true },
       { name: 'Nonce', value: `${keys[0].nonce}` , inline: true }
      )
      .setImage(IMG_POLKA_WHITE)
      .setTimestamp()
      .setFooter("Network: " + PROVIDER_NAME, IMG_POLKA);
    message.channel.send(validatorsEmbed);
     
     
  }
  if (command === "multibalance") {
    const Alice = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
    //secret Alice 0xe5be9a5092b81bca64be81d212e7f2f9eba183bb7a90954f7b76361f6edb5c0a
    const Bob = "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty";
    const balances = await api.query.system.account.multi([Alice, Bob]);
    console.log(
      `Current balances for Alice and Bob are ${balances[0].data.free} and ${balances[1].data.free}`
    );
    
  }
  }
});

client.login(config.BOT_TOKEN);
