
<p align="left">
<a href="https://polkadot.network/" target="_blank">
<img src="https://i.imgur.com/WYB7YHR.png" width="50" alt="Polkadot Logo">
</a>
</p>

# PolkaDiscordBot

## **Motivation**

**[Polkadot]**

This bot aims to use as an existing communication channel of one of the applications that many users use on a daily basis such as Discord. 


# Use Cases 

##### UC1
> As a user I want to **use Discord** so that I can  **create my first Polkadot account**.

##### UC2
> As a **user** I want to **use Discord** so that I can **check my account balance**.
##### UC3
> As a **user** I want to **use Discord** so that I can **get relevant** information of the blockchain.


>Note: this bot is agnostic from any Polkadot compatible blockchain. In this PoC we use WestEnd.


# DevFolio
https://devfolio.co/polkadot-buildathon/dashboard


# Video 

https://youtu.be/DKuLpk8A1TU

# Online Bot Access

https://discord.gg/YvAS832N

# SnapShots





| Command    | Bot Response | Description |
| -------- | -------- | -------- | 
|  *!account*  |   ![](https://i.imgur.com/qQOQ5Nm.png)  | displays all the account balance information | 
|  *!createaccount* | ![](https://i.imgur.com/zjG3322.png)   | creates an account from a random mnemonic phrase and send a private message to the user 
| *!blockchain* |  ![](https://i.imgur.com/yuXvlvn.png)    | displays all the blockchain information: name, node version, last block, etc.| 
| *!blockinfo*     | ![](https://i.imgur.com/T1ifdhi.png)| displays the actual block information of the blockchain  | 
|  *!help* | ![](https://i.imgur.com/ZdGdNnh.png)   | help commands *(send by a private message)* 
|  !validators |![](https://i.imgur.com/PbsmVYg.png)      | displays the list of actual validators of the blockchain| 



**Note:** We use Alice address in the .env file for testing purpose





| Account| 
| -------- | 
| ![](https://i.imgur.com/zeJDgyv.png)

# Potencial Impact 


>Discord is the frequent communication platform between developers, where Polkadot uses it as the main means of communication in its ecosystem. This bot aims to have a first approach to the interaction with the Polkadot blockchain, creating an account, consulting its balance and obtaining relevant information from the blockchain.



# Build & Run 

rename:
.env.example to .env
.config.json.example to .config.json.example
```
npm install
npm start

```


# Dependencies


```json=
{
  "name": "bot",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@polkadot/api": "^4.11.2",
    "discord.js": "^12.5.3",
    "dotenv": "^10.0.0"
  }
}

```




## Configuration file (.env)

```
ACCOUNT_ALICE = 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY

```


## References

1. https://www.npmjs.com/package/@polkadot/api
2. https://polkadot.network
3. https://discordjs.guide

<p align="center">
<a href="https://polkadot.network/" target="_blank">
<img src="https://i.imgur.com/WYB7YHR.png" width="150" alt="PolkadotLogo">
</a>
</p>
**About Polkadot**

Polkadot-JS API 
> The Polkadot-JS API provides easy-to-use wrappers around JSONRPC calls that flow from an application to a node. It handles all the encoding and decoding or parameters, provides access to RPC functions and allows for the query of chain state and the submission of transactions.


