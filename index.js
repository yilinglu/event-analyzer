const fs = require('fs');
const path = require('path');
const EventCounter = require('./EventCounter');
const FaultParser = require('./FaultParser');

/**
 * node index.js [deviceID] [event-log.txt]
 */
const deviceID = process.argv.slice(2,3)[0];
const fileName = process.argv.slice(3,4)[0];

console.log(`Processing file '${fileName}' for device '${deviceID}'`);

const inputStream = fs.createReadStream(fileName, {
  encoding: 'utf8'
});

const eventCounter = new EventCounter();


// Use deviceID as the id for hte FaultParser in the current use case because
// we are only looking for one type of fault.
const faultXParser = new FaultParser(deviceID);
// Load the parser that can discover the fault in the current requirement.
eventCounter.addFaultParser(faultXParser);

// const faultExoticParser = new ExoticFaultParser('Fault-Y');
// eventCounter.addFaultParser(faultYParser);
// We could write multiple parsers that each implement a different version of fault discovery DFA,
// so that in one pass of read the log file, we can discover multiple fault types.

eventCounter.parseEvents(deviceID, inputStream);

eventCounter.counterCompletes()
  .then(
    function(result){
      console.log(`Processing completed, final fault count is: ${eventCounter.getEventCount(deviceID)}`);
      ;
    },
    function(error){
      console.log(`Processing failed, error: ${JSON.stringify(error)}`)
    }
  );


