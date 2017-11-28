
/**
 * Instance of this class represents one log entry found in a log file.
 */
class LogEvent {
  /**
   * 
   * @param {string} deviceID 
   * @param {string} timeStamp timestamp string literal as it appears in the log file
   * 
   * @param {string} stage 
   */
  constructor(deviceID, timeStamp, stage){
    this.deviceID = deviceID;
    this.timeStamp = !!timeStamp? timeStamp.trim() : '';
    this.stage = !!stage? (stage + '').trim() : '';
  }

}

module.exports = LogEvent;