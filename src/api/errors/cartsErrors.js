class validationException extends Error {
    constructor(message) {
      super();
      this.name = 'ValidationException';
      this.message = message;
      this.status = 400;
    }
  }
  
  class databaseException extends Error {
    constructor(message) {
      super();
      this.name = 'DatabaseException';
      this.message = message;
      this.status = 404;
    }
  }
  
  export { validationException, databaseException };