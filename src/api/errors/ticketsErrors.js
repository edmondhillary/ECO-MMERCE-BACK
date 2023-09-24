class databaseException extends Error {
    constructor(message) {
      super();
      this.name = 'DatabaseException';
      this.message = message;
      this.status = 404;
    }
  }
  
  class validationException extends Error {
    constructor(message) {
      super();
      this.name = 'ValidationException';
      this.message = message;
      this.status = 400;
    }
  }
  
  export { databaseException, validationException };