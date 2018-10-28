let mysql=  require('mysql');
let request = require('request');

let config = require('../config');


get_mysql_client = function get_mysql_client() {
    let connection = mysql.createConnection({
        host     : config.mysql.host,
        port     : config.mysql.port,
        user     : config.mysql.user,
        password : config.mysql.password,
        database : config.mysql.database
    });
    return connection;
};

module.exports = {
    get_mysql_client: get_mysql_client,
};

//Authorization: 'Basic' + Buffer.from('superuser:DuerES123').toString('base64')

