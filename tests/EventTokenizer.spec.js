const chai = require('chai');
const expect = chai.expect; 
const EventTokenizer = require('../EventTokenizer');

describe('EventTokenizer', function() {
  it('should initialize', function() {
    const tokenizer = new EventTokenizer();
    expect(tokenizer).to.not.be.null;
    expect(tokenizer.minTokens).to.be.equal(2);
  });

  it('should tokenize tab delimited line', function() {
    const tokenizer = new EventTokenizer();
    const result = tokenizer.tokenize("2011-03-07 06:25:32		2 ");
    expect(result.length).to.equal(2);
  });

  it('should tokenize as many tabs as there is in the line', function() {
    const tokenizer = new EventTokenizer();
    const str = `We\tare\t\tstrong\t\t\ttogether!`;
    const result = tokenizer.tokenize(str);
    expect(result.length).to.equal(4);
  });

  it('should not tokenize lines with no tab', function() {
    const tokenizer = new EventTokenizer();
    const result = tokenizer.tokenize("2011-03-07 06:25:32    2 ");
    expect(result.length).to.equal(0);
  });
  it('should expect at least two tokens ', function() {
    const tokenizer = new EventTokenizer();
    const result = tokenizer.tokenize(`2011-03-07\s06:25:32\s3`);
    expect(result.length).to.equal(0);
  });
  
});