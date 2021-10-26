pragma solidity ^0.4.25;
import "./FlightSuretyData.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";



//Flight Insurance Application Smart Contract  




contract FlightSuretyApp {
    using SafeMath for uint256; 


    FlightSuretyData private fData;
    
    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    address private contractOwner;          // Account used to deploy contract
    bool operational;
    address[] public registeredAirlines;

  
//Modifiers 

    //turn off the contract in the case of a severe issue
    modifier requireIsOperational() 
    {
         // Modify to call data contract's status
        require(isOperational(), "Contract is currently not operational");  
        _;  
    }


    //For functions which require the contract owner
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }
   
   // Event for testing purposes
    event flightHasBeenRegistered(address);


  //constructor
    constructor
                                (address dataCont
                                ) public
                                 
    {
        contractOwner = msg.sender;
        operational =true;
        fData = FlightSuretyData(dataCont);       
    }


    //Get contract status
    function isOperational() public  returns(bool) 
    {
        return fData.isOperational();  
    }

    //Test function
      function javascripttesters() public returns(bool){
        return true;
    }

    //Set Operating Status
       function setOperatingStatus(bool isOper)
        external
        requireContractOwner
        returns (bool)
    {
        return fData.setOperatingStatus(isOper);
    }

   
   //Register Airline
   //If over 5 airline's have been registered then you need 3 airlines to back your registration
    function registerAirline
                            (address airline
                            )
                            external requireIsOperational
                            returns(bool)
                            
    {
    
       bool res = fData.registerAirline(airline, msg.sender);
        if(res){
         registeredAirlines.push(airline);
         return true;
         }else{
             return false;
         }
         
 
      }

    //Fund Airline

    function fundAirline (address air) external requireIsOperational returns(bool){
        bool result;
       result = fData.fund(10, air, msg.sender);
       return result;
    }


    //View registered Airline
    function getRegisteredAirline(address air)
        external view  requireIsOperational returns (bool){
         bool k  = fData.getregisteredAirline(air);
         return (k);
    }



    //Register a flight so insurance can be bought later

    function registerFlight
                                (string flightNum, string departureCity, uint64 departureTime
                                )
                                external requireIsOperational returns(bool)
                                 
    { 
        bool result = fData.registerFlight(msg.sender, flightNum, departureCity, departureTime);
      emit flightHasBeenRegistered(msg.sender);
        return result;
    }

    //Buy flight insurance 
    function buyInsurance(string flightNum) external requireIsOperational returns(bool){
        bool result;
         result = fData.buy(flightNum, msg.sender, 1);
         return true;
    }

    //Pay out the insurance for a late flight
    function pay (uint256 money, address passenger) returns (string){

      bool paided =  fData.pay(money, passenger);
        if(paided){
            return 'Insurance has been paid';
        }else{
            return 'Unsuccessfully paid';
        } 
        
    }
  
    


//ORACLE MANAGEMENT

    //Called after oracle has updated flight status
    function processFlightStatus
                                (
                                    address airline,
                                    string memory flight,
                                    uint256 timestamp,
                                    uint8 statusCode
                                )
                                internal
                                 
    {

        if(statusCode ==10){

        }else{
            fData.creditInsurees(flight, msg.sender);
        }
    }

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;    

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 1;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;        
    }

    // Tracks all registered oracles
    mapping(address => Oracle) private oracles;

    // Oracle Response Structure
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);
    event weGotHere(string); //Event for testing
    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);
    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);
    event testGotHere(string);


    // Register an oracle with the contract
    function registerOracle
                            (
                            )
                            external
                            payable requireIsOperational
    {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
                                        isRegistered: true,
                                        indexes: indexes
                                    });
    }

    //Get the Oracles Indexes
    //The Indexes are the identifier to each Oracle
    function getMyIndexes
                            (
                            )
                            view
                            external requireIsOperational
                            returns(uint8[3])
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;

    }


  // Generate a request for Oracles to fetch flight information
    function fetchFlightStatus
                        (
                            address airline,
                            string flight,
                            uint256 timestamp                            
                        )
                        external requireIsOperational 
    {
        uint8 index = getRandomIndex(msg.sender);

        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));

        oracleResponses[key] = ResponseInfo({
                                                requester: msg.sender,
                                                isOpen: true
                                            });

        emit OracleRequest(index, airline, flight, timestamp);
  
    } 


    //Oracle determines whether a flight is on time or late and submit their response
    function submitOracleResponse
                        (
                            uint8 index0,
                            address airline,
                            string flight,
                            uint256 timestamp,
                            uint8 statusCode
                        )
                        external requireIsOperational
    {
        bytes32 key = keccak256(abi.encodePacked(index0, airline, flight, timestamp)); 

        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        oracleResponses[key].responses[statusCode].push(msg.sender);

        emit OracleReport(airline, flight, timestamp, statusCode);
  

        emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
    }

    //Encode the flight information
    function getFlightKey
                        (
                            address airline,
                            string flight,
                            uint256 timestamp
                        )
                        pure
                        internal 
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes
                            (                       
                                address account         
                            )
                            internal requireIsOperational
                            returns(uint8[3])
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);
        
        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }


    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex
                            (
                                address account
                            )
                            internal requireIsOperational
                            returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

}
