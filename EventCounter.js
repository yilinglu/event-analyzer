const EventEmitter = require('events');
const readline = require('readline');
const LogEvent = require('./LogEvent');
const FaultParser = require('./FaultParser');
const Util = require('./Util');
const EventTokenizer = require('./EventTokenizer');
const fs = require('fs');


class EventCounter extends EventEmitter{
  constructor(){
    super();
    /**
     * Example of fault parser collection object.
     * Key is the unique id of the fault we are looking for.
     * Value is an instance of the parser that is designed to find this fault.
     * 
     * At the moment, we have only looking for one type of fault.
     * {
     *  'HVAC-CIRCUIT-FAILURE': [Object parser],
     *  'MOTOR-MALFUNCTION': [Object parser]
     * }
     */
    this.faultParserCol = {};

    /**
     * Example of fault count object, key is the unique id of the fault we are looking for.
     * At the moment, we only have one type of fault that is identified by device id.
     * {
     *  'deviceID': 20,
     *  'HVAC-CIRCUIT-FAILURE': 9,
     *  'MOTOR-MALFUNCTION': 0
     * }
     */
    this.faultCount = {};
    this.eventTokenizer = new EventTokenizer();

    this.counterCompletesPromise = new Promise(
      (resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      }
    );

  }
  
  addFaultParser(parser){
    this.faultParserCol[parser.id] = parser;
    this.faultCount[parser.id] = 0;

    parser.addListener(parser.id, (data)=>{
      this.faultCount[parser.id]++;
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`In progress, current fault count for device id '${data.deviceID}': ${this.faultCount[parser.id]}.    `);
    });
  }

  /**
   * Parse event records.
   * @param {string} deviceID ID of the device that the log is associated with (ex: "HV1")
   * @param {ReaderStream} streamReader A stream of lines representing time/value recordings.
   */
  parseEvents(deviceID, streamReader){ 
    console.time('Time elapsed');

    const rl = readline.createInterface({
      input: streamReader
    });
    
    rl.on('line', (line) => this.processEventLine.call(this, deviceID, line));
    rl.on('close', ()=>{
      console.log(`\nDone.`);
      console.timeEnd('Time elapsed');
      this.resolve(this.faultCount)
    });
  }

  processEventLine(deviceID, line){
    const arr = this.eventTokenizer.tokenize(line);
    // the first element in the array is expected to be a timestamp
    // string in the format of yyyy-mm-dd hh:mm:ss.
    // This format appeared in the example log entry in the requirement doc.
    // We make an assumption here that any string that does not
    // comform to this format is considered an invalid timestamp string.

    if(arr.length >= 2){
      const isExpectedTs = Util.isExpectedTimestampFormat(arr[0]);
      if(isExpectedTs){
        const evt = new LogEvent(deviceID, arr[0], arr[1]);
        Object.values(this.faultParserCol).forEach(
          (parser) => {
            parser.processEvent(evt);
          }
        );
      }      
    }
  }

  /**
   * According to the requirement doc, this method should
   * "Gets the number of “fault” sequences observed for the given device".
   */
  getEventCount(deviceID){
    return this.faultCount[deviceID];
  }

  counterCompletes(){
    return this.counterCompletesPromise;
  }

}

module.exports = EventCounter;