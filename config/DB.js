const Database = require("./database/database");

const DB = () => {  
    const DBINSTANCE = new Database(
        process.env.DB_CONNECTION, 
        process.env.DB_HOST, 
        process.env.DB_PORT, 
        process.env.DB_NAME, 
        process.env.DB_USERNAME,
        process.env.DB_PASSWORD
    );

    const DB = DBINSTANCE.initDbConnection();

    return DB
}

module.exports = DB();






