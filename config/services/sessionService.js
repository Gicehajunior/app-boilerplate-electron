const fs = require('fs');

class UserSession {
    constructor() {
        this.current_directory = process.cwd();
        this.sessionfile = `${this.current_directory}/config/database/dump/eab-session.json`;
    }

    session() {
        let session = JSON.parse(fs.readFileSync(
            this.sessionfile,  
            'utf8'
        )) 

        return session;
    }

}

module.exports = UserSession;



