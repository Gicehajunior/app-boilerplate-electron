require('dotenv').config();
const AppUserSession = require("../../../config/services/SessionService");

class MP {
    constructor () {
        this.current_directory = process.cwd();
        this.date = new Date();
        this.datetime_now = this.date.toISOString().slice(0, 19).replace('T', ' ');

        this.sessionObject = new AppUserSession(); 
        this.session = this.sessionObject.session();

        this.windowLocation = window.location.href;
    }

    clearFormInputs() {
        const formInputs = document.querySelectorAll('.form-control');

        formInputs.forEach(input => {
            input.value = null;
        });
    }
    
}

module.exports = MP;
