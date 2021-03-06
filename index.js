require("dotenv").config();
const Discord = require("discord.js");
const config = require("./config.json");
const networks = require("@polkadot/networks");
const {
  naclDecrypt,
  naclEncrypt,
  randomAsU8a,
  signatureVerify,
  mnemonicGenerate,
  mnemonicToMiniSecret,
  randomAsHex,
} = require("@polkadot/util-crypto");

const { Keyring } = require("@polkadot/keyring");
const { stringToU8a, u8aToHex, u8aToString } = require("@polkadot/util");
const { ApiPromise, WsProvider } = require("@polkadot/api");

const AUTHOR = "@aleadorjan";
const IMG_POLKA = "https://i.imgur.com/E1bgyRO.png";
const IMG_POLKA_WHITE = "https://i.imgur.com/XFV02Qh.png";
const IMG_AUTHOR = "https://i.imgur.com/wSTFkRM.png";
const URL_POLKADOT = "https://polkadot.network";
const LINK_AUTHOR = "https://discord.js.org";
const BOT_NAME = "PolkaDiscordBot";
const EMBED_COLOR_PRIMARY = 0xe6007a;
const EMBED_COLOR_SECONDARY = 0x545454;
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
  if (command === "blockinfo") {
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
        .setImage(IMG_POLKA_WHITE)
        .setTimestamp()
        .setFooter("Network: " + PROVIDER_NAME, IMG_POLKA);
      message.channel.send(blockEmbed);
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
      )
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
      .setTimestamp()
      .setFooter("Network: " + PROVIDER_NAME, IMG_POLKA);
    message.channel.send(blockChainEmbed);
  }
  if (command === "validators") {
    const validators = await Promise.all([api.query.session.validators()]);
    if (validators && validators.length > 0) {
      const validatorBalances = await Promise.all(
        validators.map((authorityId) => api.query.system.account(authorityId))
      );
      let keys = Array.from(
        validators.map((authorityId, index) => ({
          address: authorityId.toString(),
          balance: validatorBalances[index].data.free.toHuman(),
          nonce: validatorBalances[index].nonce.toHuman(),
        }))
      );
      const validatorsEmbed = new Discord.MessageEmbed()
        .setColor(EMBED_COLOR_PRIMARY)
        .setTitle(PROVIDER_NAME + " Validators ")
        .setURL("https://wiki.polkadot.network/docs/en/learn-validator#docsNav")
        .setAuthor(AUTHOR, IMG_POLKA_WHITE, LINK_AUTHOR)
        .setDescription(
          "Validators secure the Relay Chain by staking DOT, validating proofs from collators and participating in consensus with other validators. These participants will play a crucial role in adding new blocks to the Relay Chain and, by extension, to all parachains. This allows parties to complete cross-chain transactions via the Relay Chain."
        )
        .setThumbnail(IMG_POLKA)
        .addFields(
          { name: "Address", value: `${keys[0].address}`, inline: true },
          { name: "Balance", value: `${keys[0].balance}`, inline: true },
          { name: "Nonce", value: `${keys[0].nonce}`, inline: true },
          { name: "Validators #", value: keys.length, inline: false }
        )
        .setImage(IMG_POLKA_WHITE)
        .setTimestamp()
        .setFooter("Network: " + PROVIDER_NAME, IMG_POLKA);
      message.channel.send(validatorsEmbed);
    }
  }
  if (command === "createaccount") {
    const mnemonic = mnemonicGenerate();
    const keyring = new Keyring({ type: "sr25519", ss58Format: 2 });
    const pair = keyring.addFromUri(mnemonic, { name: "first" }, "ed25519");
    const createEmbed = new Discord.MessageEmbed()
      .setColor(EMBED_COLOR_PRIMARY)
      .setTitle("Account Creation")
      .setURL(
        "https://support.polkadot.network/support/solutions/articles/65000098878-how-to-create-a-dot-account"
      )
      .setAuthor(AUTHOR, IMG_POLKA_WHITE, LINK_AUTHOR)
      .setDescription(
        "You can create a DOT account in any wallet that supports Polkadot: Polkadot.js , Subkey, Parity Signer & " +
          BOT_NAME
      )
      .setThumbnail(IMG_POLKA)
      .addFields(
        {
          name: "Your mnemonic phrase. Don't share this!! ",
          value: `${mnemonic}`,
          inline: true,
        },
        {
          name: "Your Address",
          value: `${pair.address}`,
          inline: true,
        },
        {
          name: "Locked",
          value: `${pair.isLocked}`,
          inline: true,
        },
        {
          name: "Type ",
          value: `${pair.type}`,
          inline: true,
        }
      )
      .setImage(IMG_POLKA_WHITE)
      .setTimestamp()
      .setFooter("Network: " + PROVIDER_NAME, IMG_POLKA);
    message.author.send(createEmbed);
  }
  if (command === "encrypt") {
    const timeTaken = Date.now() - message.createdTimestamp;
    const secret = randomAsU8a();
    const messagePreEncryption = stringToU8a("MESSAGE");
    const { encrypted, nonce } = naclEncrypt(messagePreEncryption, secret);
    console.log(`Encrypted message: ${JSON.stringify(encrypted, null, 2)}`);
    const messageDecrypted = naclDecrypt(encrypted, nonce, secret);
    const equals =
      u8aToString(messagePreEncryption) === u8aToString(messageDecrypted);
    console.log(`Ok? ${equals}`);
    message.reply(`Latency ${timeTaken}ms.`);
  }
  if (command === "helpbot") {
    const helpEmbed = new Discord.MessageEmbed()
      .setColor(EMBED_COLOR_PRIMARY)
      .setTitle("Help")
      .setURL("https://polkadot.network")
      .setAuthor(AUTHOR, IMG_POLKA_WHITE, LINK_AUTHOR)
      .setDescription(
        "Polkadot development is on track to deliver the most robust platform for security, scalability and innovation."
      )
      .setThumbnail(IMG_POLKA)
      .addFields(
        {
          name: "!account ",
          value: ` displays all the account balance information `,
          inline: true,
        },
        {
          name: "!blockchain ",
          value: `displays all the blockchain name, node version, last block, etc.`,
          inline: true,
        },
        {
          name: "!blockinfo ",
          value: `displays the actual block information of the blockchain`,
          inline: true,
        },
        { name: "!helpbot ", value: `help command`, inline: true },
        {
          name: "!validators ",
          value: `displays the list of actual validators of the blockchain`,
          inline: true,
        }
      )
      .setImage(IMG_POLKA_WHITE)
      .setTimestamp()
      .setFooter("Network: " + PROVIDER_NAME, IMG_POLKA);
    message.author.send(helpEmbed);
  }
});
client.login(config.BOT_TOKEN);