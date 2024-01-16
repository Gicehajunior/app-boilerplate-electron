require('dotenv').config(); 

class ExceptionHandler {

    constructor(app) {
      this.app = app;
      this.debug = process.env.DEBUG
    }
  
    handle(error) {
        if (this.debug.toLocaleUpperCase() == 'TRUE') {
            if (error instanceof Error) {
                // Handle errors that are instances of Error.
                this.handleError(error);
            } else if (error instanceof Rejection) {
                // Handle errors that are instances of Rejection.
                this.handleRejection(error);
            } else {
                // Handle errors that are not instances of Error or Rejection.
                this.handleUnknownError(error);
            }
        }
        else {
            process.exit();
        }
    }
  
    handleError(error) {
        const message = error.message;
    
        const stackTrace = error.stack;
    
        console.error(message);
        console.error(stackTrace);
    
        ipcRenderer.send('error', {
            error: {status: 500, message: message}
        });
    }
  
    handleRejection(error) {
        const reason = error.reason;
    
        const stackTrace = error.stack;
    
        console.error(reason);
        console.error(stackTrace);
    
        ipcRenderer.send('error', {
            error: {status: 500, message: reason}
        });
    }
  
    handleUnknownError(error) { 
        const message = error.message;
     
        const stackTrace = error.stack;
     
        console.error(message);
        console.error(stackTrace);

        ipcRenderer.send('error', {
            error: {status: 500, message: message}
        });
    }
}

module.exports = ExceptionHandler;