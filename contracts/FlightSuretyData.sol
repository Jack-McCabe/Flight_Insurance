pragma solidity ^0.4.25;
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

//Data contract
//There is separation of data and application contracts because if we need to upgrade the application we want the base
//data to be remain

contract FlightSuretyData {
    using SafeMath for uint256;

//Data Variables 
    address private contractOwner;  // Account used to deploy contract
    bool private operational = true;  // Blocks all state changes throughout the contract if false
    

    struct Flights {
        bool isRegistered;
        address airline;
        string flightNum;
        string departureCity;

        uint64 departureTime;
    }
 
    struct Airlines{
        address airline;
        bool isRegistered;
        bool isFunded;
        uint funds;
    }

    bool reseting = true;
 
    uint64 totalAprovedAirlines; //Number of Approved Airlines
    mapping(address => address[]) approvalRouting; //1st address, address of the airliens, the second is the list of petitioning airlines
    mapping(address => Airlines) airlines; // Approved Airlines 

    mapping(string => Flights) flights; 
    mapping(string => address[]) customers;
    mapping(bytes32 => uint) InsuranceLedger; //bytes is both thepassenger and flights concatenated together; 
    //instead of having 3 varaislbe we push the two variables together

    mapping(address => uint256) owedMoney;
    mapping(address => bool) authCallers;
            


    //Events
    event AirlinesRegistered (address indexed airlineregis);
    event FlightRegistered (address indexed flightregis);
    event PassCredited (address indexed pass, uint256 value);

   

    //Constructor
    constructor
                                (
                                ) 
                                public 
    {
        contractOwner = msg.sender;
        totalAprovedAirlines =1;
            airlines[contractOwner].airline = contractOwner;
            airlines[contractOwner].isRegistered = true;
            airlines[contractOwner].isFunded =true;
            approvalRouting[contractOwner].push(contractOwner);
    }


    //Function Modifiers

    //Contract must be Operational
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    //Require Contract Owner
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/


    //Checks the Operational Status of the Contract
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;
    }

    //Sets the Operating Status
    function setOperatingStatus
                            ( bool mode) 
                            external 
                            returns(bool)
    {

        operational = mode;
        return mode;
    }

    function authorizeCaller(address authorizedCaller){
        authCallers[authorizedCaller]=true;
    }


    //Gets contract owner address
    function getContractOwnerAddress () view returns(address){
        return contractOwner;
    }

    //Registers airlines
    function registerAirline
                            (address air, address sender)                            
                            external returns(bool)
                            
    {
       require(!airlines[air].isRegistered, "Airlines is  registered"); //undefined! equal false 
       //Require funding
       require(airlines[sender].isFunded, "Sender not funded"); 
       
            if(totalAprovedAirlines < 3){ 
                                        
                        airlines[air].airline = air;
                        airlines[air].isRegistered = true;
                        airlines[air].isFunded = false;
                      
                        totalAprovedAirlines = totalAprovedAirlines+1;
                        approvalRouting[air].push(sender);
                        emit AirlinesRegistered(sender);
                     
                        return true;
               
                
            }else {
                bool isDuplicate =false; 
                uint x;
                for(x =0; x <approvalRouting[air].length; x++ ){
                    if(approvalRouting[air][x] == sender){
                        isDuplicate = true;
                    }
                }
                require(isDuplicate == false, "Duplicate call by airlines");

                if(approvalRouting[air].length > (totalAprovedAirlines/2) ){
                        airlines[air].airline = air;
                        airlines[air].isRegistered = true;
                        airlines[air].isFunded = false;
                      
                        totalAprovedAirlines = totalAprovedAirlines+1;
                        approvalRouting[air].push(sender);
                        emit AirlinesRegistered(sender);
                     
                        return true;
                } else {
                     approvalRouting[air].push(sender);
                }
            
                    return false; }

    }
    
    //Returns if an airline is registered
    function getregisteredAirline(address air)external returns (bool) {
        
        bool returnValue;
       address results = airlines[air].airline;

       if(results ==air){
           returnValue = true;
       }else{
           returnValue =false;
       }
        return returnValue;
    }
    

    //Registers a flight
    function registerFlight(address air, string flightNum, string departureCity, uint64 departureTime)
    external returns(bool){

        require(airlines[air].isRegistered, "Airlines not registered");
  
        flights[flightNum].isRegistered =true;
        flights[flightNum].airline = air;
        flights[flightNum].flightNum = flightNum;
        flights[flightNum].departureCity = departureCity;
        flights[flightNum].departureTime = departureTime;
        
         emit FlightRegistered(air); 

          return true;
    }

    //returns the flight
    function getFlight(string flightNum) view returns(string){
        return flights[flightNum].departureCity;
    }

    //buy insurance for the flight  
    function buy
                            (string flightNum, address passenger, uint value                 
                            )
                            external
                            payable returns(bool)
    {
    require(flights[flightNum].isRegistered, "Flight not registered");
    bytes32 passFlight = keccak256(abi.encodePacked(passenger, flightNum));
    require(InsuranceLedger[passFlight] == uint(0), "Already bought insurance");
    require(value <= 1, "Can only pay up to 1 ether for insurance" ); 
        
        InsuranceLedger[passFlight]=value; 
        return true;
    }    
   
 
    //Provides credit to the Inusrees
    function creditInsurees(string flightNum, address passenger
                                )
                                external
                                payable
    {
      
        bytes32 passFlight = keccak256(abi.encodePacked(passenger, flightNum));
        require(InsuranceLedger[passFlight] == uint(0), "No insurance bought");
       owedMoney[passenger] =  owedMoney[passenger] + (InsuranceLedger[passFlight]*2);
    }

    function getAmountCredited (string flighNum, address passenger) external returns (uint256){

        uint256 results = owedMoney[passenger];
        return results;
    }
     

    //Provides the insurance payout
    function pay
                            (uint256 money, address passenger
                            )
                            external
                            payable returns(bool)
    {
    
        require(msg.sender == passenger, "Not senders funds");
        require((owedMoney[passenger]-money) >= 0, "Insufficent money to pay insurance");
    
        owedMoney[passenger]= owedMoney[passenger]-money;

        msg.sender.transfer(money);
        
        emit PassCredited(passenger, money);
        return true;
    }
  
    
    



    //Funds the airline so they can start registering flights and have money for insurance
    function fund
                            (uint amount, address airlinesAddress, address petitioner
                            )
                            public
                            payable returns(bool)
    {
        require(airlines[petitioner].isRegistered == true, "Unregisterd airlines cannot fund" );

      //  approvedAirlines[airlinesAddress].funds = approvedAirlines[airlinesAddress].funds+amount; 
        airlines[airlinesAddress].isFunded = true;
        return true;
    }


    //Checks to see if the address is an airline
    function isAirline(address airlineAddress) public returns(bool){
    return airlines[airlineAddress].isRegistered;
    }

    //Gets the encoded flight key
    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }


// Fallback function for funding smart contract.
    function() 
                            external 
                            payable 
    {
        fund(3, msg.sender, msg.sender);
    }


}

