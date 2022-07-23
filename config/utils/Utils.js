require('dotenv').config();
class Util { 
    constructor(db, database_table) { 
        this.db = db;
        this.database_table = database_table;
        this.database_type = process.env.DB_CONNECTION;

        this.sql_statement;
    }
    
    sql_prepare_stm_query_marks(array = []) {
        let question_marks_array = [];
        array.forEach(key => {
            question_marks_array.push("?");
        });
    
        let question_marks_inline_list  = question_marks_array.toString(); 
    
        return question_marks_inline_list;
    }

    inline_sql_where_stmt_list_string(object = {}) {
        let array = Object.entries(object);
        let object_list_string = [];
    
        array.forEach(element => {  
            object_list_string.push(`${element[0]} = '${element[1]}'`); 
        });
    
        let inline_object_list_string = object_list_string.toString();
    
        return inline_object_list_string;
    } 
    
    save_resource(post_object = {}) {
        const response_promise = new Promise(resolve => {
            try {  
                let object = JSON.parse(post_object);
                const keys = Object.keys(object);
                const values = Object.values(object); 
            
                const inline_keys_list  = keys.toString();  
                
                if (this.database_type == "sqlite") {
                    this.sql_statement = `INSERT INTO ${this.database_table} VALUES(${this.sql_prepare_stm_query_marks(keys)})`;
                    this.sql_statement = this.db.prepare(this.sql_statement)
                    this.sql_statement.run(values);

                    if (this.sql_statement.finalize()) {
                        resolve(true);
                    } 
                    else {
                        resolve(false);
                    }  
                }
                else if (this.database_type == "mysql") {
                    this.sql_statement = `INSERT INTO ${this.database_table} (${inline_keys_list}) VALUES(${this.sql_prepare_stm_query_marks(keys)})`;
                    this.db.query(this.sql_statement, values, (err, result) => {
                        if (err) {
                            if (err) { 
                                resolve(false);
                            } 
                        }
                        else {
                            resolve(true);
                        }
                    }); 
                } 
            } catch (error) { 
                resolve(false);
            }
        });

        return response_promise;
    }
    
    update_resource_by_id(post_object = {}, id) {  
        const response_promise = new Promise(resolve => {
            try { 
                let object = JSON.parse(post_object);

                if (this.database_type == "sqlite") { 
                    this.sql_statement = this.db.prepare(`UPDATE ${this.database_table} SET ${this.inline_sql_where_stmt_list_string(object)} WHERE rowid = ?`);
                    this.sql_statement.run(id);

                    if (this.sql_statement.finalize()) {
                        resolve(true);
                    } 
                    else {
                        resolve(false);
                    }  
                }
                else if (this.database_type == "mysql") { 
                    this.sql_statement = `UPDATE ${this.database_table} SET ${this.inline_sql_where_stmt_list_string(object)} WHERE id = ?`;
                    this.db.query(this.sql_statement, id, (err, result) => {
                        if (err) {  
                            resolve(false);
                        }
                        else {
                            resolve(true);
                        }
                    }); 
                } 
            } catch (error) {   
                resolve(false);
            }
        });

        return response_promise;
    }
}


module.exports = Util;



