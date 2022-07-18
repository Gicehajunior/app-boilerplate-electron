const current_directory = process.cwd();
const Database = require(`../database/database`);
require('dotenv').config();

const DB = new Database(
    process.env.DB_CONNECTION, 
    process.env.DB_HOST, 
    process.env.DB_PORT, 
    process.env.DB_NAME, 
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD
);
  
let connection_response = undefined;
if (process.env.DB_CONNECTION == "mysql") {
    connection_response = DB.mysql_connection();
    connection_response.then(response => {  
        if (response.state !== "authenticated") { 
            if (response.includes("Unknown database")) {
                console.log(`${response}.`);
                console.log("System trying to create a database for you now.");

                const create_database_response = DB.create_mysql_database(); 
                create_database_response.then(response => {  
                    if (response.includes("created")) {
                        console.log(`Database '${process.env.DB_NAME}' successfully setup!`);
                        setTimeout(() => {
                            process.exit();
                        }, 2000);
                    }
                }); 
            }
        }
        else {
            setTimeout(() => {
                process.exit();
            }, 1000);
        }
    }); 
}
else if (process.env.DB_CONNECTION == "sqlite") { 
    connection_response = DB.sqlite3_connection();
    
    if (connection_response) {
        console.log(`Database '${process.env.DB_NAME}' successfully setup!`);
                    
        setTimeout(() => {
            process.exit();
        }, 1000);
    }
}

