import mysql from 'mysql'

const connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'bug_db',
	insecureAuth: true
})

connection.connect(err => {
	if (err) throw new Error('mySql failed connection')
	console.log('connected to SQL server')
})


function runSQL(sqlCommand, params = []) {
	return new Promise((resolve, reject) => {
		connection.query(sqlCommand, params, (error, results) => {
			if (error) reject(error)
			else resolve(results)
		})
	})
}

// connection.end()

export const dbService = {
	runSQL
}

