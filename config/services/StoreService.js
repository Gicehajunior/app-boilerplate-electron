const {app, electron} = require('electron');
const path = require('path');
const fs = require('fs');

class Store {
    constructor(opts) {
        this.opts = opts;
        // Renderer process has to get `app` module via `remote`, 
        // whereas the main process can get it directly
        // app.getPath('userData') will return a string of the user's app data directory path.
        this.userDataPath = this.getAppBasePath(); 
        this.current_working_dir = process.cwd();
        
        // We'll use the `configName` property to set the file name and 
        // path.join to bring it all together as a string
        this.path = path.join(this.userDataPath, `${this.opts.folder ? this.opts.folder + '/' : ''}${this.opts.configName}.json`);
        
        if (!fs.existsSync(`${this.userDataPath}${this.opts.folder ? this.opts.folder + '/' : ''}`)) {
            this.create_dir_if_not_exists(`${this.current_working_dir}/public`, this.opts.folder);
            this.path = path.join(`${this.current_working_dir}/public`, `${this.opts.folder ? this.opts.folder + '/' : ''}${this.opts.configName}.json`);
        } 

        this.data = this.parseDataFile(this.path, this.opts.defaults);
    }

    getAppBasePath = () => {
        //development
        if (process.env.RUN_ENV === 'development') {
            return './'
        }

        if (!process.platform || !['win32', 'darwin'].includes(process.platform)) {
            console.error(`Unsupported OS: ${process.platform}`);
            return './'
        }

        //produnction
        if (process.platform === 'darwin') { 
            return `/Users/${process.env.USER}/Library/Application\Support/${process.env.APP_NAME}/`
        } 
        else if (process.platform === 'win32') { 
            return `${process.env.APPDATA}\\${process.env.APP_NAME}\\`
        }
    }

    get_data_path () {
        return this.path;
    }

    create_dir_if_not_exists(root_path, path_getting_created) {
        fs.mkdir(path.join(root_path, `${path_getting_created}`),
            { recursive: true }, (err) => {
            if (err) {
                console.error(err);
            } 
        });
    }
    
    // This will just return the property on the `data` object
    get(key = undefined) {
        let data = key ? this.data[key] : this.data; 

        return data;
    }
    
    // ...and this will set it
    set(post_object) { 
        const object = JSON.parse(post_object);
        const object_array = Object.entries(object);

        this.data = this.data ? this.data : {};

        object_array.forEach(element => { 
            this.data[element[0]] = element[1];  
        });

        let write;

        try {
            // Wait, I thought using the node.js' synchronous APIs was bad form?
            // We're not writing a server so there's not nearly the same IO demand on the process
            // Also if we used an async API and our app was quit before the asynchronous 
            // write had a chance to complete,
            // we might lose that data. Note that in a real app, we would try/catch this.
            write = fs.writeFileSync(this.path, JSON.stringify(this.data));
        } catch (error) {
            write = error;
        }

        return write;
    }

    parseDataFile(filePath, defaults) {
        // We'll try/catch it in case the file doesn't exist yet, 
        // which will be the case on the first application run.
        // `fs.readFileSync` will return a JSON string which we then 
        // parse into a Javascript object
        try {
            const data = fs.readFileSync(filePath);

            return JSON.parse(data);
        } catch(error) {
            // if there was some kind of error, return the passed in defaults instead. 
            return defaults;
        }
    }
} 

module.exports = Store;