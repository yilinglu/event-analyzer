const EventEmitter = require("events");
const Util = require('./Util');
const Fault = require('./Fault');
/**
 * This class implements a deterministic finite automata (DFA)
 * to process input log event and discover faults - a 
 * sequence of log event that forms a pattern over time as defined
 * in the requirement document.
 * 
 * A fault is found each time when this DFA reaches its final state.
 * 
 * Interface method:
 * processEvent(event), event is of type LogEvent.
 * This class must emit an event that is of type Fault after a fault is found.
 * 
 * This parser perfoms at O(n) scale.
 */
class FaultParser extends EventEmitter {
  // id: fault id identifies the unique fault this parser is set to discovery.
  constructor(id) {
    super();
    this.id = id;

    /*
      Value for stage uniquely identifies a state
      'initial', '3', '2' are the possible stage values.
      When in 'stage 2' state, an input of log event of stage 0
      will transition this DFA to its final state, which is a indication 
      of a fault found; this DFA will immediately be reset to its initial state,
      ready to process the next log event. 
    */
    this.state = this.getInitState();
  }

  /**
   * Returns an initial state object
   */
  getInitState(){
    return {
      stage: 'initial',
      // The event that made this DFA transition to this state.
      event: undefined
    }
  }

  processEvent(event){
    switch(this.state.stage+''){
      case 'initial':
        this.state = this.initialStateReducer(this.state, event);
        break;
      case '3':
        this.state = this.stage3StateReducer(this.state, event);
        break;
      case '2':
        this.state = this.stage2StateReducer(this.state, event);
        break;
    }
  }
  /**
   * Initial state only transition to "stage 3" state when the input is a
   * stage-3 log event.
   *
   * @param {*} curState
   * @param {*} event
   */
  initialStateReducer(curState, event) {
    let nextState = Object.assign({}, curState);

    if (event.stage == "3") {
      nextState.stage = event.stage;
      nextState.event = Object.assign({},event);
    }
    return nextState;
  }

  /**
   *
   * @param {*} curState current state is in "stage 3" state
   * @param {*} event
   */
  stage3StateReducer(curState, event) {
    let nextState = Object.assign({}, curState);
    
    /**
     * 'stage 3' state only transition to 'stage 2' state when the input is
     * a stage 2 event that is 5 mins or more apart.
     *
     * Any other event will not cause state transition.
     */
    if (event.stage == "2") {
      if(Util.secondsApart(event.timeStamp, this.state.event.timeStamp, 300000)){
        nextState.stage = event.stage;
        nextState.event = Object.assign({},event);
      }else{
        // stage 2 event appear less than 5 mins after the stage 3 event 
        // will transition this DFA back to initial state.
        nextState = this.getInitState();
      }
    }
    return nextState;
  }

  stage2StateReducer(curState, event) {
    let nextState = Object.assign({}, curState);

    /**
     * A stage 0 event can transition this DFA to its final state, which represents
     * the discovery of one fault. We emit a fault object for interested parties.
     * We reset the state back to initial state.
     *
     * Any ther event will not cause state change.
     */
    if (event.stage == "0") {
      nextState = this.getInitState();

      //each Fault instance represents one fault discovered.
      this.emit(this.id, new Fault(event.deviceID));
    }
    return nextState;
  }
}

module.exports = FaultParser;
