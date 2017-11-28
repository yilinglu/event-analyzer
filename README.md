h2. Pre-requisite
h3. Nodejs 
This program is developed on Node 9.2.0, tested on Node 9.2.0 and 

h2. Application Architecture Design Considerations

h2. Performance of this Program

Time
This program performs in O(n) time, while n is the number of event entries in the log file.

This program can also search for multiple different faults in O(n) time, which means that
we can extend and configure this program to search for a different fault that is represented by another sequence of events besides the fault defined in the current requirement.

Space

Memory and Disk Usage
Due to use of stream in reading log files, the memory footprint of this program remains constant 
independent of the size of the log files processes. 
This program does not need extra disk storage space to perform its file process/analysis.

Memory Usage Statistics
On a MacBook Pro laptop with 4 physical cores, the observed memory footprint of this program is in the range of 42-45 MB.

Network Latency
This programs does not need network access during operation.

Performance Statistics

Given a file that contains 1 million lines of event log entries, this program can process all the entries and find fault in slightly over 1 second.

Given a file that contains 5 million lines of event log entries, the average processing time is 5.4 seconds.

For 10 million log entries, the average processing times is 10 seconds.
For 100 million log entries(file size about 1.2G), the average processing time is 65 seconds.
