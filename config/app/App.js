
const fs = require("fs");

class App{

    constructor(file_name = undefined) {  
        this.file = file_name; 
    }

    file_parser(file_name, post_object = undefined) { 
        this.file = (this.file == undefined) ? file_name : this.file;

        const file_buffer = fs.readFileSync(this.file);

        if (file_buffer) {
            var file_ = file_buffer.toString(); 

            for (const key in post_object) {  
                var search = `{{ ${key} }}`;
                if (file_.includes(search)) { 
                    file_ = file_.split(search).join(post_object[`${key}`]); 
                }  
            }  

            return file_;
        }

        return 'Oops unknown error!'; 
    }

}

module.exports = App;