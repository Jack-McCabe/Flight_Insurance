# Flight__Insurance


In a terminal,
ganache-cli -m "monster size loyal enable man purity mixed beef next october motor chimney"

Open a separate terminal, 
truffle compile
truffle migrate --reset

Test
truffle test ./test/flightSurety.js
truffle test ./test/oracles.js

Run
npm run server
npm run dapp

View/Interact
http://localhost:8000

Possible values to use on the application:

Airline Address: 0x83f0E702C7fb6b56A4a9D45668F75426d26713c4
Passenger Address:0xA667534d734f4bbA99D4992591BF873b4e35E9Fb
Airline Fund Value: 1
Flight: 
  Flight Number: 836
  Departure City: Singapore
  Departure Time: 1835
  Airline Address: A previously registered Airline (0x83f0E702C7fb6b56A4a9D45668F75426d26713c4)



The Flight Insurance application requires you to register your airlines. Once it is registered you should fund your airline with ether to place your stake. Then you have the ability to create flights and passengers can buy insurance for these flights. Then you can insert the flight information and Oralces in the server will determine if the flight was on-time or late, if it was late the passenger can recieve their payout. 




Versions
npm verision 6.14.8
Truffle v5.1.59 
Solidity v0.5.16
Node v14.15.1
Web3.js v1.2.9
webpack ^4.44.2
