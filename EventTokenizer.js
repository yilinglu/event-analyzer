class EventTokenizer {
  // separator shoudl be a regex expression

  /**
   * The default tokenizer - zero argument constructor uses tab as delimitor 
   * and expects at least two tokens.
   * 
   * @param {string or regular expression} separator 
   * @param {integer} minTokens minimum number of tokens expected in a line
   */
  constructor(separator = /\t{1,}/, minTokens = 2){
    this.separator = separator;
    this.minTokens = minTokens;
  }

  tokenize(line){
    if(line){
      const arr = line.split(this.separator);
      if(arr.length >= this.minTokens){
        return arr;
      }else{
        // console.warn(`This line is not an expected event record: ${line}`);
        return [];
      }
    }
    return [];
      
  }
}

module.exports = EventTokenizer;