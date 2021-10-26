/*
This is the source code, trying something new but saving this incase we need to revert

const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

module.exports = function(deployer) {

    let firstAirline = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
    deployer.deploy(FlightSuretyData)
    .then(() => {
        return deployer.deploy(FlightSuretyApp(FlightSuretyData.address))
                .then(() => {
                    let config = {
                        localhost: {
                            url: 'http://localhost:8545',
                            dataAddress: FlightSuretyData.address,
                            appAddress: FlightSuretyApp.address
                           // gas: deployer.networks[deployer.network].gas
                        }
                    }
                    fs.writeFileSync(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                    fs.writeFileSync(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                });
    });
}

*/

const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');

registerFirstAirline = undefined;
module.exports = function(deployer) {


    deployer.deploy(FlightSuretyData)
    .then( () => {
        return deployer.deploy(FlightSuretyApp, FlightSuretyData.address)
                .then(async () => {
                    let config = {
                        localhost: {
                            url: 'ws://localhost:9545',
                            dataAddress: FlightSuretyData.address,
                            appAddress: FlightSuretyApp.address
                        }
                    };

                    accounts = await web3.eth.getAccounts();
                    let flightSuretyData = await FlightSuretyData.new();
                    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);
                    await flightSuretyData.authorizeCaller(flightSuretyApp.address);
                    


                    await fs.writeFile(__dirname + '/../src/dapp/config.json',JSON.stringify(config, null, '\t'), 'utf-8', function (err, data) {});
                    await fs.writeFile(__dirname + '/../src/server/config.json',JSON.stringify(config, null, '\t'), 'utf-8', function (err, data) {});
                });
    });
};