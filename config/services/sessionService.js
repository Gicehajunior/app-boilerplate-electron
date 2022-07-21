const StoreService = require("./StoreService");
const fs = require("fs").promises;
class UserSession {
    constructor() {
        this.current_directory = process.cwd(); 

        this.StoreService = new StoreService({folder: "Session Storage", type: "login_user", configName: 'eab-session', });

        this.session;
    }

    session(key) {
        try {
            this.session = this.StoreService.get(key ? key : '');
        } catch (error) {
            this.session = {};
        }

        return this.session;
    }

    save_session(object) {
        const store_response = this.StoreService.set(object);

        return store_response;
    }

    delete_session() {
        const response_promise = new Promise((resolve, reject) => {
            let session_file = this.StoreService.get_data_path();
            fs.unlink(`${session_file}`, (err) => {
                if(err && err.code == 'ENOENT') { 
                    resolve("File doesn't exist, won't remove it.");
                } else if (err) { 
                    reject("Error occurred while trying to remove file");
                } else {
                    resolve(`User Session Cleared. User got logged out!`);
                }
            });
        });

        return response_promise;
    }

}

module.exports = UserSession;



