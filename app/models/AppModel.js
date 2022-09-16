
class AppModel {

    constructor () { 
        this.current_directory = process.cwd();
        this.country = process.env.COUNTRY;
        this.database_type = process.env.DB_CONNECTION; 

        this.date = new Date();
        this.datetime_now = this.date.toISOString().slice(0, 19).replace('T', ' ');

        this.created_at = this.datetime_now;
        this.updated_at = this.datetime_now;
    }

}

module.exports = AppModel;
