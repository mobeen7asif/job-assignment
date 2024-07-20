class Helper {
    static isNullOrEmpty(value) {
      return value === null || 
             (typeof value === 'object' && 
              (Object.keys(value).length === 0 && !Array.isArray(value))) ||
             (Array.isArray(value) && value.length === 0);
    }
  }
  
  module.exports = Helper;