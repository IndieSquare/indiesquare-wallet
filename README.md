# IndieSquare wallet
---

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

[params DEX] NOTE: Must be JSON format.
```
[Required] screen (string): fixed with "dex"
[Required] token (string): Name of the token to be trade
[Optional] type (string): buy | sell (default = buy)
[Optional] amount (float): number of orders
[Optional] price (float): order price
[Optional] currency (float): (default = XCP)
```
ex: Buy 1 ZONO token for 100 yen.
`indiewallet://screen_to?params={"screen":"dex", "token":"ZONO", "type":"buy", "amount":1, "price":100, "currency": "JPY"}`