const AppUserSession = require("../../config/services/SessionService");
const App = require("../../config/app/App");
class AppModel extends App{

    constructor () { 
        super();
        this.current_directory = process.cwd();
        this.country = process.env.COUNTRY;
        this.database_type = process.env.DB_CONNECTION; 

        this.date = new Date();
        this.datetime_now = this.date.toISOString().slice(0, 19).replace('T', ' ');

        this.created_at = this.datetime_now;
        this.updated_at = this.datetime_now;
        
        this.auth = new AppUserSession();
        this.session = this.auth.session();
        this.app = new App();
    }

}

module.exports = AppModel;
