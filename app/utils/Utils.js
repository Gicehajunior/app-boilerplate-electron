require('dotenv').config();
const DB = require('../../config/DB');
class Util { 
    constructor() {   
        this.database_type = process.env.DB_CONNECTION; 
        this.database_table = undefined;
        this.select_query = undefined;
        this.update_query = undefined;
        this.delete_query = undefined;
        this.columns = '*';
    }

    select(table, columns = []) { 
        if (columns.length > 0) {
            this.columns = columns.join(',') 
        } 

        this.database_table = table; 
        this.select_query = `SELECT ${this.columns} FROM ${this.database_table}`;
    }

    _select_query(values, query = undefined) {
        this.select_query = (query == undefined) ? this.select_query : query;
        const response = new Promise(resolve => {
            DB.all(this.select_query, values, (err, rows) => {
                if(err){ 
                    console.log(`Debug Error: ${err}`);
                    resolve(err); 
                }else{ 
                    resolve(rows);
                }
            }); 
        }); 

        return response;
    }

    where(condition, operator = 'AND') {
        const validOperators = ['AND', 'OR'];
        let conditions = undefined;
        let values = undefined;
      
        if (!validOperators.includes(operator.toUpperCase())) {
          throw new Error(`Invalid operator: ${operator}`);
        }
      
        if (condition instanceof Array) {
          if (condition.length === 0) {
            throw new Error('Empty condition array');
          }
          else {
            this.select_query += ` WHERE `
          }

          if (condition.length > 1) {
            if (operator.toUpperCase() === 'AND') {
                this.select_query += ` ${operator} `;
            } else if (operator.toUpperCase() === 'OR') {
                this.select_query += ` ${operator} `;
            } 
          }  
      
          this.select_query += ` ${condition[0]} IN (${condition.slice(1).map(() => '?').join(', ')})`;
        } else if (typeof condition === 'object') {
          if (Object.keys(condition).length === 0) {
            throw new Error('Empty condition object');
          }
          else {
            this.select_query += ` WHERE `
          } 

          if (Object.keys(condition).length > 1) {
            if (operator.toUpperCase() === 'AND') {
                this.select_query += ` ${operator} `;
            } else if (operator.toUpperCase() === 'OR') {
                this.select_query += ` ${operator} `;
            }
            conditions = Object.keys(condition).map(key => `${key} = ?`).join(` ${operator} `);
          } else {
            conditions = Object.keys(condition).map(key => `${key} = ?`);
          }
          
          values = Object.values(condition); 
          this.select_query += ` ${conditions}`; 
        } else {
          throw new Error('Invalid condition type');
        } 

        return this._select_query(values);
    }

    whereIn(column, values, operator = 'AND') {
        const validOperators = ['AND', 'OR'];
      
        if (!validOperators.includes(operator.toUpperCase())) {
          throw new Error(`Invalid operator: ${operator}`);
        }
      
        if (!Array.isArray(values) || values.length === 0) {
          throw new Error('Invalid values');
        }
        if (Object.keys(condition).length > 1) {
            if (operator.toUpperCase() === 'AND') {
                this.select_query += ` ${operator} `;
            } else if (operator.toUpperCase() === 'OR') {
                this.select_query += ` ${operator} `;
            }
        }
        this.select_query += ` ${column} IN (${values.map(() => '?').join(', ')})`;
      
        return this._select_query();
    }

    whereNot(column, values, operator = 'AND') {
        const validOperators = ['AND', 'OR'];
      
        if (!validOperators.includes(operator.toUpperCase())) {
          throw new Error(`Invalid operator: ${operator}`);
        }
      
        if (!Array.isArray(values) || values.length === 0) {
          throw new Error('Invalid values');
        }
      
        if (Object.keys(condition).length > 1) {
            if (operator.toUpperCase() === 'AND') {
                this.select_query += ` ${operator} `;
            } else if (operator.toUpperCase() === 'OR') {
                this.select_query += ` ${operator} `;
            }
        }
      
        this.select_query += ` ${column} NOT IN (${values.map(() => '?').join(', ')})`;
      
        return this._select_query();
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
                    this.select_query = `INSERT INTO ${this.database_table} VALUES(${this.sql_prepare_stm_query_marks(keys)})`;
                    this.select_query = DB.prepare(this.select_query)
                    this.select_query.run(values);

                    if (this.select_query.finalize()) {
                        resolve(true);
                    } 
                    else {
                        resolve(false);
                    }  
                }
                else if (this.database_type == "mysql") {
                    this.select_query = `INSERT INTO ${this.database_table} (${inline_keys_list}) VALUES(${this.sql_prepare_stm_query_marks(keys)})`;
                    DB.query(this.select_query, values, (err, result) => {
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
                    this.update_query = DB.prepare(`UPDATE ${this.database_table} SET ${this.inline_sql_where_stmt_list_string(object)} WHERE rowid = ?`);
                    this.update_query.run(id);

                    if (this.update_query.finalize()) {
                        resolve(true);
                    } 
                    else {
                        resolve(false);
                    }  
                }
                else if (this.database_type == "mysql") { 
                    this.update_query = `UPDATE ${this.database_table} SET ${this.inline_sql_where_stmt_list_string(object)} WHERE id = ?`;
                    DB.query(this.update_query, id, (err, result) => {
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



