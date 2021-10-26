
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;

  let owna = accounts[0];

  //Airlines 
  let airline2 = accounts[2];
  let airline3 = accounts[3];
  let airline4 = accounts[4];
  let airline5 = accounts[5];
  let airline6 = accounts[6];
  let airline7 = accounts[7];
  let airline8 = accounts[8];


  // 
  const AIRLINE_FUNDING_VALUE = web3.utils.toWei("10", "ether");
  const PASSENGER_INSURANCE_VALUE_1 = web3.utils.toWei("2", "ether");
  const PASSENGER_INSURANCE_VALUE_2 = web3.utils.toWei("1.5", "ether");
  const TIMESTAMP = Math.floor(Date.now() / 1000);
  const STATUS_CODE_LATE_AIRLINE = 20;
  const TEST_ORACLES_COUNT = 20;
  const ORACLES_OFFSET = 20;

    //pasenengers, cna possibly change to [10]/[11]
let passenger_1 =accounts[11]
let passenger_2 =accounts[12]

  //Flights
  let flight_1 = {
    airline: airline2,
    flight: "9Q 450", 
    from: "SGP",
    to: "IND", 
    timestamp: TIMESTAMP
  }

  let flight_2 = {
    airline: airline2,
    flight: "3S 231", 
    from: "USA",
    to: "CHN", 
    timestamp: TIMESTAMP
  }





  before('setup contract', async () => {
    config = await Test.Config(accounts);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    console.log("Accounts: \n")
    console.log(accounts);
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`End to End Test, FlightSuretyData to FlightSuretyApp`, async function(){
    
   let  successful = true;
   try{
    instance = await config.flightSuretyApp.registerAirline(airline8, {from: owna});

    let fundingAir = await config.flightSuretyApp.fundAirline(airline8, {from:airline8, gas: 1000000});

    let registFlight = await config.flightSuretyApp.registerFlight('flight Number', 'SG', 2348, {from:airline8});
  

    
    // having a passenger buy insurance
    let buyingInsurance = await config.flightSuretyApp.buyInsurance('flight Number', {from: airline7});
    
    await config.flightSuretyData.creditInsurees('flight Number', airline7);

   let insurPayout = await config.flightSuretyData.getAmountCredited('flight Number', airline7);
   } catch{
     successful = false;
   }
    assert(successful, true, 'Properly can register an airline, fund an airline, register a flight, buy insruance, credit passenger and payout passenger');


  });

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });


  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    let newAirline = accounts[7];

    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: airline6});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirline.call(newAirline); 

    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });


});


