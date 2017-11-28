const chai = require('chai');
const expect = chai.expect; 
const FaultParser = require('../FaultParser');
const LogEvent = require('../LogEvent');

describe('FaultParser', function() {
  it('should initialize to proper state ', function() {
    const faultParser = new FaultParser('device-99');
    expect(faultParser).to.not.be.null;
    expect(faultParser.state.stage).to.be.equal('initial');
  });

  it("should only transition from 'initial' to stage 3 on an input of stage 3 event", function() {
    const parser = new FaultParser('device-0');
    const event = new LogEvent('device-0', '2011-03-07', 2);
    parser.processEvent(event);
    expect(parser.state.stage).to.be.equal('initial');

    const stage0Evt = new LogEvent('device-0', '2011-03-07', 0);
    parser.processEvent(stage0Evt);
    expect(parser.state.stage).to.be.equal('initial');
    
    const stageXEvt = new LogEvent('device-0', '2011-03-07', 'x');
    parser.processEvent(stageXEvt);
    expect(parser.state.stage).to.be.equal('initial');

    const stageEmptyEvt = new LogEvent('device-0', '2011-03-07', '');
    parser.processEvent(stageEmptyEvt);
    expect(parser.state.stage).to.be.equal('initial');
    
    const stage3Evt = new LogEvent('device-0', '2011-03-07', '3');
    parser.processEvent(stage3Evt);
    expect(parser.state.stage).to.be.equal('3');
  });

  it("should transition to stage 2 after more than 5 minutes", function(){
    const parser = new FaultParser('device-0');
    
    const stage3Evt = new LogEvent('device-0', '2011-03-07 06:25:32', '3');
    parser.processEvent(stage3Evt);
    expect(parser.state.stage).to.be.equal('3');

    const stage2Evt = new LogEvent('device-0', '2011-03-07 06:30:32', '2');
    parser.processEvent(stage2Evt);
    expect(parser.state.stage).to.be.equal('2');
  });

  it("should reset to initial state if input stage 2 event happened less more than 5 minutes after stage 3 event", function(){
    const parser = new FaultParser('device-0');
    
    const stage3Evt = new LogEvent('device-0', '2011-03-07 06:25:32', '3');
    parser.processEvent(stage3Evt);
    expect(parser.state.stage).to.be.equal('3');

    const stage2Evt = new LogEvent('device-0', '2011-03-07 06:30:31', '2');
    parser.processEvent(stage2Evt);
    expect(parser.state.stage).to.be.equal('initial');
  });  


  it("should stay in stage 2", function(){
    const parser = new FaultParser('device-0');
    
    const stage3Evt = new LogEvent('device-0', '2011-03-07 06:25:32', '3');
    parser.processEvent(stage3Evt);
    expect(parser.state.stage).to.be.equal('3');

    const stage2Evt = new LogEvent('device-0', '2011-03-07 06:30:33', '2');
    parser.processEvent(stage2Evt);
    expect(parser.state.stage).to.be.equal('2');

    const stage3Evt_1 = new LogEvent('device-0', '2011-03-07 06:31:33', '2');
    parser.processEvent(stage3Evt_1);
    expect(parser.state.stage).to.be.equal('2');

    const stage2Evt_1 = new LogEvent('device-0', '2011-03-07 06:32:33', '3');
    parser.processEvent(stage2Evt_1);
    expect(parser.state.stage).to.be.equal('2');
    
  });   

  it("should transition to final stage", function(){
    let testDevice = 'device-777';
    const parser = new FaultParser(testDevice);
    let result;
    parser.addListener(testDevice, (data)=>{
      result = data;
    });
    
    const stage3Evt = new LogEvent(testDevice, '2011-03-07 06:25:32', '3');
    parser.processEvent(stage3Evt);
    expect(parser.state.stage).to.be.equal('3');

    const stage2Evt = new LogEvent(testDevice, '2011-03-07 06:30:33', '2');
    parser.processEvent(stage2Evt);
    expect(parser.state.stage).to.be.equal('2');

    const stage3Evt_1 = new LogEvent(testDevice, '2011-03-07 06:31:33', '2');
    parser.processEvent(stage3Evt_1);
    expect(parser.state.stage).to.be.equal('2');

    const stage2Evt_1 = new LogEvent(testDevice, '2011-03-07 06:32:33', '3');
    parser.processEvent(stage2Evt_1);
    expect(parser.state.stage).to.be.equal('2');
    
    const stage0Evt = new LogEvent(testDevice, '2011-03-07 06:32:33', '0');
    parser.processEvent(stage0Evt);
    expect(parser.state.stage).to.be.equal('initial');
    expect(result).to.not.be.null;
    expect(result.deviceID).to.be.equal(testDevice);
  });    

});