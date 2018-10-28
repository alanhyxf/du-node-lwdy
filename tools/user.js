

let ConnUtils = require('./tools/ConnUtils');


var getUserName =function (userID){
		
			let mysql_conn = ConnUtils.get_mysql_client();

			let query_str =
				"SELECT name " +
				"FROM hy_users " +
				"WHERE (userID = ?) " +
				"LIMIT 1 ";

			let query_var = userID;

			var query = mysql_conn.query(query_str, query_var, function (err, results, fields) {
				//if (err) throw err;
				if (err) {
					//throw err;
					console.log(err);
					logger.info(err);
					reject(err);
				}
				else {
					resolve(rows);
					console.log(rows);
					return results[0].name;
				}
			});

};



module.exports = {
    getUserName: getUserName,
};