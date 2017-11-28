/**
 * This file is used to generate test data.
 */
const fs = require('fs');
const path = require('path');

setImmediate(generateLog, {name: 'event-log-test-sm.txt', count: 1000});
// setImmediate(generateLog, {name: 'event-log-test-lg.txt', count: 1e+6});
// setImmediate(generateLog, {name: 'event-log-test-xl.txt', count: 5e+6});

/**
 * Generate 4 faults in two different fault event patterns.
 * Will generate 25 + count number of events with 4 fault patterns among the events.
 * 
 * @param {*} name Name of the test log file to be generated.
 * @param {*} count Total number if log events to be generated that don't include fault patterns; 
 * Add this number with the total number of log events generated .
 * 
 */
function generateLog(option){
  const {name, count} = option;
  const file = fs.createWriteStream(name);
  file.write('Timestamp' + '\t' + 'Value' + '\n');
  var randDate = Date.parse('2010-01-01T00:00:00');

  randDate  = randDate + getRandomInt(30000, 90000);
  let eventDate = new Date(randDate);

  const value = genFalsePositiveFaultPattern(eventDate);
  value.faultEvents.forEach((line) => file.write(line));
  randDate = value.eventDate.getTime();
  
  for(let i=0; i<count; i++) {
    randDate  = randDate + getRandomInt(30000, 90000);
    let eventDate = new Date(randDate);
  
    if(i == Math.ceil(count/2) || i == Math.ceil(count/4)){
      // Generate 2 fault patterns that contains 12 events
      // insert at about quater and mid section of the data set
      const value = genFaultPattern(eventDate);
      value.faultEvents.forEach((line) => file.write(line));
      randDate = value.eventDate.getTime();

    }else if(i == Math.ceil(3*count/4) || i == Math.ceil(count-1)){
      // Generate 2 fault patterns that contains 8 events, insert at
      // about 3/4 portion of the data set and at the end of the data set.
      const value = genNoRedunantFaultPattern(eventDate);
      value.faultEvents.forEach((line) => file.write(line));
      eventDate = value.eventDate;
    }
    // generate a stage 2 event, this event would not be able to create more fault patterns
    // file.write(generateEventEntry(eventDate, 2));
    writeToFS([generateEventEntry(eventDate, 2)], file);
  }
  
  file.end();
}

/**
 * Take into account back pressure of disk write operation.
 * 
 * @param {*} array 
 * @param {*} writer 
 */
function writeToFS(array, writer){
  var i=0; 
  write();
  function write(){
    //ok to write
    let ok = true;
    while(i < array.length && ok){
      let ok = writer.write(array[i]);
      i++;
    }
  }
  if(i < array.length){
    new EventEmitter().once('drain', write);  
  }
}

function generateEventEntry(inputDate, stage = 3){
  return `${formatDate(inputDate)}\t${stage}\n`;
}

/**
 * Generate a 6-event fault pattern with a redunant stage-3 event in the beginning
 * @param {Date} eventDate Date to use for start generating the fault event.
 */
function genFaultPattern(eventDate){
  let faultEvents = [];
  // transition to stage 3
  faultEvents.push(generateEventEntry(eventDate, 3));

  // a redundant recording of stage 3 after 1 minute
  eventDate = incrementDate(eventDate, 60000);
  faultEvents.push(generateEventEntry(eventDate, 3));

  // direct transition to stage 2 after another 4 minutes
  deventDatet = incrementDate(eventDate, 4*60000);
  faultEvents.push(generateEventEntry(eventDate, 2))

  // transition back to stage 3 after 20 seconds
  eventDate.setTime((deventDatet.getTime() + 20000));
  faultEvents.push(generateEventEntry(eventDate, 3))

  // transition back to stage 2 after 10 seconds
  eventDate.setTime((eventDate.getTime() + 10000));
  faultEvents.push(generateEventEntry(eventDate, 2))
  
  // transition to stage 0 after 90 seconds
  eventDate.setTime((eventDate.getTime() + 90000));
  faultEvents.push(generateEventEntry(eventDate, 0))
  
  eventDate.setTime((eventDate.getTime() + 10000));
  return {faultEvents,eventDate};
}

/**
 * Generate a four-event fault pattern with no redunant stage 3 event in the beginning
 * @param {Date} eventDate Date to use for start generating the fault event.
 */
function genNoRedunantFaultPattern(eventDate){
  let faultEvents = [];
  // transition to stage 3
  faultEvents.push(generateEventEntry(eventDate, 3));

  // direct transition to stage 2 after 6 minutes
  eventDate = incrementDate(eventDate, 6*60000);
  faultEvents.push(generateEventEntry(eventDate, 2))

  // transition back to stage 3 after 1 minute
  eventDate.setTime((eventDate.getTime() + 60000));
  faultEvents.push(generateEventEntry(eventDate, 3))

  // transition to stage 0 after 90 seconds
  eventDate.setTime((eventDate.getTime() + 90000));
  faultEvents.push(generateEventEntry(eventDate, 0))
  
  eventDate.setTime((eventDate.getTime() + 10000));
  return {faultEvents,eventDate};
}

/**
 * Generate a sequence of events that is a fault in terms of event patterns, 
 * but the state of 'stage 3' only lasts for 4 minutes instead of >= 5 minutes.
 * @param {time in milliseconds}  
 */
function genFalsePositiveFaultPattern(eventDate){
  let faultEvents = [];
  // transition to stage 3
  faultEvents.push(generateEventEntry(eventDate, 3));

  // direct transition to stage 2 after 4 minutes
  eventDate = incrementDate(eventDate, 4*60000);
  faultEvents.push(generateEventEntry(eventDate, 2))

  // transition back to stage 3 after 1 minute
  eventDate.setTime((eventDate.getTime() + 60000));
  faultEvents.push(generateEventEntry(eventDate, 3))

  // transition back to stage 2 after 2 minute
  eventDate.setTime((eventDate.getTime() + 120000));
  faultEvents.push(generateEventEntry(eventDate, 2))

  // transition to stage 0 after 90 seconds
  eventDate.setTime((eventDate.getTime() + 90000));
  faultEvents.push(generateEventEntry(eventDate, 0))
  
  eventDate.setTime((eventDate.getTime() + 10000));
  return {faultEvents,eventDate};
}

function incrementDate(date, incMilSec){
  date.setTime((date.getTime() + incMilSec));
  return date;
}

/**
 * Inclusive at min, exclusive at max
 * Copy from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
 * 
 * @param {*} min 
 * @param {*} max 
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function formatDate(date){
  return date.getUTCFullYear() + '-' + padd(getOneBasedMonth(date.getUTCMonth())) + '-' + padd(date.getUTCDate()) 
    + ' ' + padd(date.getUTCHours()) + ':' + padd(date.getUTCMinutes()) + ':' + padd(date.getUTCSeconds());
}

function getOneBasedMonth(mm){
  return mm + 1;
}

function padd(c){
  const str = (c + '').trim();
  if(str.length == 1){
    return '0' + str;
  }else{
    return str;
  }
}