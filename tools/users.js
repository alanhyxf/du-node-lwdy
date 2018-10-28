

let ConnUtils = require('./ConnUtils');


var getUserName =function (userID,callback){
		
                let mysql_conn = ConnUtils.get_mysql_client();
		console.log(userID);
                mysql_conn.query('select * from hy_users where (userid = ' + userID + ')',function (error, results, fields) {
                	if (typeof(results) != "undefined" && results.length > 0){
			    console.log(results[0].username);
			    return results[0].username;
			}else{
			   console.log("no user");
			   return "no user";
			}
		});
	};




module.exports = {
    getUserName: getUserName,
};
