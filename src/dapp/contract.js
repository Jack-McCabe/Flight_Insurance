import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {

    
    constructor(network, callback) {

        let config = Config[network];
        let address = config.appAddress;
        console.log(address);
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }


    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 5) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }
    javascripttesters(callback){
        let self = this; 
        self.flightSuretyApp.methods.javascripttesters().call({from:self.owner}, callback);
    }

    async registerAirline(airlining, guarantor,  callback){
        let self = this;
       let x = await self.flightSuretyApp.methods.registerAirline(airlining).send({from: guarantor,  gas: 1000000}, callback);
        return x;
        /*
        self.flightSuretyApp.methods.registerAirline(airlining).send({ from: self.owner, gas: 1000000}, (error, result) => {
            callback(error, result);
        });
        */
    }

    fundAirline(air, callback){
        let self = this;
        self.flightSuretyApp.methods.fundAirline(air).send({from: self.owner}, callback);

    }

    async getRegisteredAirline(air, callback){
        let self = this;
        let z  = await self.flightSuretyApp.methods.getRegisteredAirline(air).call({from: self.owner}, callback);
        return z;

    }

    // fetchFlightStatus(airline, flight, timestamp
     fetchFlightStatus(airline, flight, timestamp, callback) {
        let self = this;

            self.flightSuretyApp.methods.fetchFlightStatus(airline, flight, timestamp).send({from:airline, gas:888888}, callback);
    }
    

    buyInsurance(flightNum, insurPassenger, callback){
        let self = this;
        self.flightSuretyApp.methods.buyInsurance(flightNum).send( {from: insurPassenger}, callback);
    }

    pay(money, passenger, callback){
        let self = this;
        self.flightSuretyApp.methods.pay(money, passenger).send({from:passenger }, callback);
    }

    
    registerFlight(flightNumber, flightCity, flightTim, airlineValue, callback){

        let self = this; 

        self.flightSuretyApp.methods
        .registerFlight(flightNumber, flightCity, flightTim)
        .send({from: airlineValue, gas: 888888}, callback);
        //console.log(callback);
    }





}