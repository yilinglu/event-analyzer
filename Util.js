/**
 * Check if a string is in the following timestamp format
 * 'yyyy-mm-dd hh:mm:ss'.
 * 
 * 
 * @param {string} str 
 */
function isExpectedTimestampFormat(str){
  const validTs = /[^0]\d{3}-[0-1][0-9]-[0-3][0-9]\s+[0-2]\d:[0-5]\d:\d{2}/;
  return validTs.test(str);
}

/**
 * 
 * @param {string} ts1 A timestamp string that already passed the isExpectedTimestampFormat test
 * @param {string} ts2 A timestamp string that already passed the isExpectedTimestampFormat test
 * @param {integer} delta integer, number of milliseconds
 * 
 * Return true if ts1 - ts2 >= delta, false otherwise, including when ts2 - ts1 >= delta.
 */
function secondsApart(ts1, ts2, delta){
  [ts1, ts2] = [ts1, ts2].map((ts)=> ts.replace(/\s+/, 'T'))
  const result = Date.parse(ts1) - Date.parse(ts2) >= delta;
  return result;
}

module.exports = {
  isExpectedTimestampFormat: isExpectedTimestampFormat,
  secondsApart: secondsApart
};