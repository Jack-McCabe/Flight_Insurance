
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {

        // Read transaction
        contract.isOperational((error, result) => {
          
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        contract.javascripttesters((error, result) =>{
           
        });

   


        // User-submitted transaction
        DOM.elid('submit-flight').addEventListener('click', () => {
            let flightNumber = DOM.elid('flight-number').value;
            let flightCity = DOM.elid('flight-city').value;
            let flightTime = DOM.elid('flight-time').value; 
            let airlineValue = DOM.elid('airlineValue').value;
            // Write transaction

            contract.registerFlight(flightNumber, flightCity, flightTime, airlineValue, (error, result) => {
        
         
           console.log("Flight Successfully Registered \n \n"+ "Flight Number: "+ flightNumber + "\nFlight City: "+ flightCity + "\n Flight Time: "+ flightTime + "\nAirline Address: "+ airlineValue);
            });
        });


         DOM.elid('submit-airline').addEventListener('click', async () => { 

            let airline = DOM.elid('airline').value; //this will be the airline address passed to the function
            let guarantor = DOM.elid('guarantor').value;
            // Write transaction
            console.log('Registered  Airline  ' +airline);
          
          let f = await contract.registerAirline(airline, guarantor, (error, result) => {
                console.log('Succesuful registerd this airline     ' + result + error);
              
               
            });
            let resuls = JSON.stringify(f);
           

        });

 
        DOM.elid('buy-insurance').addEventListener('click', () =>{

                let flightNumforInsur = DOM.elid('insurFlightNum').value;
                let insurPassenger = DOM.elid('insurPassenger').value;

                contract.buyInsurance(flightNumforInsur, insurPassenger, (error, result) =>{

                    console.log("Flight insurance confirmation transaction hash    " + result);
                });

        });


            DOM.elid('fund-airline').addEventListener('click', () =>{
                let air = DOM.elid('airlinevalue').value;
  

            contract.fundAirline(air, (error, result)=>{
                console.log(error, result);
               
                console.log("Funded this Airlines   "+air);

            }); 
        });

        
        DOM.elid('fetch-oracle-response').addEventListener('click', async() =>{
            
            let airline = DOM.elid('arln').value;
            let flight = DOM.elid('flgt').value;
            let timestamp = DOM.elid('tmstmp').value;
            let flightCity =DOM.elid('flightCity').value;

            contract.fetchFlightStatus(airline, flight, timestamp, (error, result) =>{
                
              //  display('Oracles', 'Trigger oracles', 'someting' [{ label: 'Register Flight', 
              //  error: error, value: result.flightNumber + ' ' + flightCity+ ' ' + flightTime + ' ' + result.timestamp }]);
 
            });
            
        });


        DOM.elid('fetch-airlines').addEventListener('click', async ()=>{ 
            let air = DOM.elid('activeAirline').value;
           let z = await contract.getRegisteredAirline(air, (error, result)=>{
                console.log("Airlines is registered (true/false): "+result);
            });
            
            let results = JSON.stringify(z);
            
         
        });



        DOM.elid('insurance-payout').addEventListener('click', ()=>{ 

            let monies = DOM.elid('moneyOwed').value;
            let passenger = DOM.elid('passenger').value;
            
            contract.pay(monies, passenger,(error, result)=>{
                console.log("Insurance payout results "+result);
            });
        });


    
       
    
    });
    

})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}







