const chai = require('chai');
const expect = chai.expect; 
const Util = require('../Util');

describe('Util', function() {
  it('should identify acceptable timestamp string format', function() {
    const exp = Util.isExpectedTimestampFormat('2011-03-07 06:25:32');
    expect(exp).to.be.true;
  });

  it('should identify non-acceptable timestamp string format', function() {
    const exp = Util.isExpectedTimestampFormat('x');
    expect(exp).to.be.false;
  });
  it('should identify non-acceptable timestamp string format-1', function() {
    const exp = Util.isExpectedTimestampFormat('1011-01-91 06:25:32');
    expect(exp).to.be.false;
  });
  it('should identify non-acceptable timestamp string format-2', function() {
    const exp = Util.isExpectedTimestampFormat('1011-01-91 06:25:80');
    expect(exp).to.be.false;
  });
  it('should compare two timestamps correctly.', function() {
    const exp = Util.secondsApart('2011-03-07 06:25:32', '2011-03-07 06:25:32', 0);
    expect(exp).to.be.true;
  });
  it('should compare two timestamps correctly-1.', function() {
    const exp = Util.secondsApart('2011-03-07 06:30:32', '2011-03-07 06:25:32', 300000);
    expect(exp).to.be.true;
  });
  it('should compare two timestamps correctly-2.', function() {
    const exp = Util.secondsApart('2011-03-07T06:30:32', '2011-03-07T06:25:32', 300000);
    expect(exp).to.be.true;
  });

  it('should compare two timestamps correctly-3.', function() {
    const exp = Util.secondsApart('2011-03-07 06:25:32', '2011-03-07 06:30:32', 300000);
    expect(exp).to.be.false;
  });
  
  it('should compare two timestamps correctly-4.', function() {
    const exp = Util.secondsApart('2011-03-07 06:25:32', '2011-03-07 06:28:32', 300000);
    expect(exp).to.be.false;
  });

})