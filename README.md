# Event Analyzer - Finding Faulty Event Patterns Fast!
## Prerequisite
### Nodejs 
Install the latest [Node](https://nodejs.org/en/) with version >= 9.0.

This program is developed and tested on Node 9.2.0.

## Unit Testing
Run `npm test` to execute all unit tests, all tests should pass before proceeding to next steps.

## Run this Application
Open a terminal window, go to project root directory where this readme.md file resides.

1. Type `node index.js HVAC-9 event-log-example.txt`,
You can expect to see output like the following. The app should report 2 faults found in the log file.
```
Processing file 'event-log-example.txt' for device 'HVAC-9'
In progress, current fault count for device id 'HVAC-9': 2.
Done.
Time elapsed: 6.138ms
Processing completed, final fault count is: 2
```
1. Try with your own log file `node index.js device-id [path-to-your-file]`. Both device id argument and file path arguments must be present on the command line.

## Application Design Considerations
This program is comprised of these major components:
1. Tokenizer (EventTokenizer.js)
    
    It simply tokenize each line in a log file into an array of tokens.

1. Parser (FaultParser.js)

    Parser is at the core of this program.
    It implements a deterministic finite automata to process and identify a fault pattern in the event log. It maintains an immutable state through the state transition process.

    Each of its reducer function implements a state transition logic from the requirements documents. 

    The pure functions (reducers) and immutable state makes the testing easy and the behaviour of of the parser easy to understand.

    See inline doc in FaultParser.js for more details.

1. Event Counter (EventCounter.js)

    Event counter handles reading from a read stream, passes the content read to FaultParser and listens for fault (Fault.js) emitted from FaultParser.
    It informs interested party with the final fault count by resolving a promise, which can be accessed via the counterCompletes method.

1. Application entry point (index.js)
    The application start with assemble paser with event counter, create a read stream from the user specified file and kick of the processing.

## Performance of this Program

### Time
This program performs in O(n) time, while n is the number of event entries in the log file.

This program can also search for multiple different faults in O(n) time, which means that
we can extend and configure this program to search for a different fault that is represented by another sequence of events besides the fault defined in the current requirement.

### Space

Memory and Disk Usage
Due to use of stream in reading log files, the memory footprint of this program remains constant 
independent of the size of the log files processes. 
This program does not need extra disk storage space to perform its file process/analysis.

### Memory Usage Statistics
On a MacBook Pro laptop with 4 physical cores, the observed memory footprint of this program is in the range of 42-45 MB.

### Network Latency
This programs does not need network access during operation.

### Performance Statistics

* Given a file that contains 1 million lines of event log entries, this program can process all the entries and find fault in slightly over 1 second.

* Given a file that contains 5 million lines of event log entries, the average processing time is 5.4 seconds.

* For 10 million log entries, the average processing times is 10 seconds.
* For 100 million log entries(file size about 1.2G), the average processing time is 65 seconds.

## Test Data Set
Developer uses `event-gen.js` to generate test data sets for development and testing.
Running `node event-gen.js` will re-generate file `event-log-test-sm.txt`, which contains 1000 event records with 4 fault patterns within them.
