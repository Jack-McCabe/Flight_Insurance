import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';
import "babel-polyfill";
var cors = require('cors')

console.log("RUNNING SERVER");


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);


let registeredOracles = [];
let indexes = [];
let numOfOracleAccts = 4;


//registers  Oracles
async function registerOracles(){

  let oracleAccounts = await web3.eth.getAccounts();



  for (let x=0; x <numOfOracleAccts; x++){

    registeredOracles.push(oracleAccounts[x]);
    
    await flightSuretyApp.methods.registerOracle().send({
      from: oracleAccounts[x],
      value:1000000000000000000,
      gas:6721974
    });
    console.log(oracleAccounts[x] + '   this Oracle is Registered it is Oracle: ' + x);
  }

  for (let x=0; x <numOfOracleAccts; x++){
  
    let index =  await flightSuretyApp.methods.getMyIndexes().call({from: oracleAccounts[x], gas: 1000000000});
  
    indexes.push(index);
  
    console.log("Indexes Pushed for Oracle "+ x);
    console.log(index);
  }
}

registerOracles();

//Now events and sending oracle repsonse
function flightLate(){
 let yn = (Math.random()*100);
 yn = Math.floor(yn);

 if(yn>75){
   return 10;}

  if(yn>55){
  return 30;} 

  if(yn>35){
 return 40;}

 if(yn>25){
 return 50;}
 else{
   return 20;
 }
}

//writing a function that will listen for an event in the contract and then that will trigger the 
//server to look at the Oracle responses
async function oracleResponse(event){

  let idx = event.returnValues.index;
  let arln = event.returnValues.airline;
  let flgt = event.returnValues.flight;
  let tmestmp = event.returnValues.timestamp;

  for (let x =0; x <numOfOracleAccts; x ++){
    let lateorNot = flightLate();


    try {
      console.log("Submitting Oracle Responses");
      console.log("index =  " +idx+ "arline =  "+ arln +"    "+ "fligt =  "+ flgt +"    " + "\ntimestamp =  "+ tmestmp +"    "+ "late or on time(10 response) = "+ lateorNot);
      console.log("Oracle Account " +registeredOracles[x]);

      await flightSuretyApp.methods.submitOracleResponse(idx, arln, flgt, tmestmp, lateorNot).send({from:registeredOracles[x]});
   
      console.log("Succesfully Submitted Oracle Response from server, status code is:  " + lateorNot);
      
    }catch (error){
        console.log ("There was an error submiting the Oracle Response");
        console.log(error);
      }
    }
  }



//Here is wher ewe cn register oralce, send information on flights if they are late or not 
flightSuretyApp.events.OracleRequest({
  fromBlock: 0
}, async function (error, event) {
  if (error) console.log(error)

  oracleResponse(event);

});

//Used to test events
flightSuretyApp.events.testGotHere({
  fromBlock:0},
  async function(error, event){
  }
);
flightSuretyApp.events.flightHasBeenRegistered({
  fromBlock: 0}, 
  async function (error, event) {
    if (error) console.log(error)

}  );


function appStart(){
  return new Promise((resolve, reject) => {

    log(web3.eth.getAccounts);
    console.log("this is the main account, logging from server.js" + account[0]);
    web3.eth.defaultAccount = account[0];  });
}


  

const app = express();

app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})


export default app;


