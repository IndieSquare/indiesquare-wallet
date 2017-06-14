# IndieSquare wallet
---

#Carry Counterparty wherever you go!
IndieSquare Wallet makes it easier for everyone to unlock the true potential of tokens.<br />

##What is IndieSquare Wallet?
IndieSquare Wallet is the world’s first Counterparty wallet built for mobile devices.<br />
For the first time you can send and receive tokens (as well as many other features) straight from your smartphone!

##What is Counterparty?
"The world’s first protocol for decentralized financial tools" ―counterparty.io<br />
Counterparty allows you to create custom “Tokens” on the Bitcoin blockchain and expand the possibility of Bitcoin

##Features of the app

* **Easy access to Counterparty tokens**<br />
Use a 4 digit PIN or fingerprint(iOS) for quick access. Counterparty is available wherever and whenever.

* **Send, receive and issue tokens**<br />
Just like Bitcoin, you can scan QR Codes to send and receive Counterparty tokens. You can also issue your own tokens from the palm of your hand using your smartphone.

* **Push notifications**<br />
Push notifications are available for interaction between IndieSquare wallets. Real-time notification makes tokens even closer to you.

* **Trade on the Decentralized Exchange**<br />
All Counterparty tokens are ready to be traded on the Decentralized Exchange(DEX) in a secure manner using the blockchain.

* **Client-side encryption**<br />
Your private key is heavily encrypted and stored in the application. It is never revealed on the server. Secure and trustless.

* **View the value of token's in your local currency**<br />
IndieSquare Wallet supports multiple fiat currencies in addition to the dollar, euro and yen, giving you the ability to check the value of your tokens in your local currency.

* **Compatible with Counterwallet.io**<br />
Passphrases generated on our wallet are fully compatible with other Counterparty wallets.

#Linkage with IndieSquare wallet.

##CIPS
https://github.com/CounterpartyXCP/cips/blob/master/cip-0002.md

**Sweep Implemantation**

Format: `counterparty:[WIF]?[optionals]`

[optionals]
```
asset: Token name that send. Will send all tokens if there is no this.
amount: Send amount. Will send all amount if there is no this.
label: Label that send from. (Gift card name etc...)
message: Message from send from.
```
ex: `counterparty:5HndkSI...?asset=SARUTOBI&amount=1&label=PaperTakara&message=ForYou!`

---
**Payment Implemantation**

Format: `counterparty:[cp address]?[optionals]`

[optionals]
```
asset: Token name that send. Will send all tokens if there is no this.
amount: Send amount. Will send all amount if there is no this.
currency: USD, JPY etc...
regular_dust_size: optional dust size.
```
ex: `counterparty:1hjeos...?asset=SARUTOBI&amount=1&regular_dust_size=15430`

---
## URL scheme

Format: `indiewallet://[:method]?params=[:params]`

**Screen transition**

method: **screen_to**

[params Send] NOTE: Must be JSON format.
```
[Required] screen (string): fixed with "dex"
[Required] token (string): Name of the token to be send
[Optional] destination (string): The bitcoin address that to be sent to
```
ex: Send 0.001 BTC.
`indiewallet://screen_to?params={"screen": "send", "token": BTC, "destination": "1Gbdhsk..." }`


[params DEX] NOTE: Must be JSON format.
```
[Required] screen (string): fixed with "dex"
[Required] token (string): Name of the token to be trade
[Optional] type (string): buy | sell (default = buy)
[Optional] amount (float): number of orders
[Optional] price (float): order price
[Optional] currency (float): (default = XCP)
```
ex: Buy 1 INDIESQUARE token for 1 USD.
`indiewallet://screen_to?params={"screen":"dex", "token":"INDIESQUARE", "type":"buy", "amount":1, "price":1, "currency": "USD"}`
