import mysql from 'mysql2'

export class Db {
    connection: any

    constructor(dbUser: string, dbPassword: string, dbName: string) {
        let host = "localhost" // this will change in the future
        this.connection = mysql.createConnection({
            host: host,
            user: dbUser,
            password: dbPassword,
            database: dbName
        });
    }

    async connect(): Promise<boolean> {
        return await new Promise((resolve) => this.connection.connect(err => {
            if (err) {
                return resolve(false)
            };
            return resolve(true)
        }))
    }

    async getTables() {
        try {
            // paginated results
            const [results, fields]: any = await new Promise((resolve, reject) => {
                this.connection.query(
                    "SHOW TABLES;",
                    (err, results, fields) => {
                        if (err) return reject(err);
                        resolve([results, fields.map(f => {
                            delete f._buf
                            return f
                        })]);
                    }
                );
            });

            return {
                entries: results.map(r => {
                    return {
                        table_name: Object.values(r)[0]
                    }
                }),
                fields
            };
        } catch (err) {
            console.log("error fetching data from db: ", err)
            return null
        }
    }

    async getTableItems(table: string, page: number = 1, limit: number = 25): Promise<any> {
        try {
            const offset = (page - 1) * limit;

            // get columns names to enable ordering
            const columns: any[] = await new Promise((resolve, reject) => {
                this.connection.query(`SHOW COLUMNS FROM \`${table}\`;`, (err, results) => {
                    if (err) return resolve([]);
                    resolve(results);
                });
            });

            if (!columns || columns.length === 0) {
                throw new Error(`No columns found for table "${table}"`);
            }
            const columnNames = columns.map(col => col.Field);
            const sortColumn = columnNames.includes('id') ? 'id' : columnNames[0];

            // paginated results
            const [results, fields]: any = await new Promise((resolve, reject) => {
                this.connection.query(
                    `SELECT * FROM \`${table}\` ORDER BY \`${sortColumn}\` LIMIT ? OFFSET ?`,
                    [limit, offset],
                    (err, results, fields) => {
                        if (err) return reject(err);
                        resolve([results, fields.map(f => {
                            delete f._buf
                            return f
                        })]);
                    }
                );
            });

            return {
                sort_by: sortColumn,
                page,
                limit,
                entries: results,
                fields
            };
        } catch (err) {
            console.log("error fetching data from db: ", err)
            return null
        }
    }

    async getItem(table: string, field: string, fieldValue: string, page: number = 1, limit: number = 25): Promise<any> {
        try {
            const offset = (page - 1) * limit;

            // get columns names to enable ordering
            const columns: any[] = await new Promise((resolve, reject) => {
                this.connection.query(`SHOW COLUMNS FROM \`${table}\`;`, (err, results) => {
                    if (err) return resolve([]);
                    resolve(results);
                });
            });

            if (!columns || columns.length === 0) {
                throw new Error(`No columns found for table "${table}"`);
            }
            const columnNames = columns.map(col => col.Field);
            const sortColumn = columnNames.includes('id') ? 'id' : columnNames[0];

            // paginated results
            const [results, fields]: any = await new Promise((resolve, reject) => {
                this.connection.query(
                    `SELECT * FROM \`${table}\` WHERE \`${field}\` = ${fieldValue} LIMIT ? OFFSET ?`,
                    [limit, offset],
                    (err, results, fields) => {
                        if (err) return reject(err);
                        resolve([results, fields.map(f => {
                            delete f._buf
                            return f
                        })]);
                    }
                );
            });

            return {
                sort_by: sortColumn,
                page,
                limit,
                entries: results,
                fields
            };
        } catch (err) {
            console.log("error fetching data from db: ", err)
            return null
        }
    }

    async join(table: string, joinTable: string, field: string, joinField: string, fieldValue: string, page: number = 1, limit: number = 25): Promise<any> {
        try {
            const offset = (page - 1) * limit;

            // get columns names to enable ordering
            const columns: any[] = await new Promise((resolve, reject) => {
                this.connection.query(`SHOW COLUMNS FROM \`${table}\`;`, (err, results) => {
                    if (err) return resolve([]);
                    resolve(results);
                });
            });

            if (!columns || columns.length === 0) {
                throw new Error(`No columns found for table "${table}"`);
            }
            const columnNames = columns.map(col => col.Field);
            const sortColumn = columnNames.includes('id') ? 'id' : columnNames[0];

            // paginated results
            const [results, fields]: any = await new Promise((resolve, reject) => {
                this.connection.query(
                    `
SELECT 
    *
FROM \`${table}\` AS a 
JOIN \`${joinTable}\` AS b 
ON a.${field} = b.${joinField}
WHERE a.${field} = ? LIMIT ? OFFSET ?`,
                    [fieldValue, limit, offset],
                    (err, results, fields) => {
                        if (err) return reject(err);
                        resolve([results, fields.map(f => {
                            delete f._buf
                            return f
                        })]);
                    }
                );
            });

            return {
                sort_by: sortColumn,
                page,
                limit,
                entries: results,
                fields
            };
        } catch (err) {
            console.log("error fetching data from db: ", err)
            return null
        }
    }

    async close() {
        await this.connection.end();
    }
}