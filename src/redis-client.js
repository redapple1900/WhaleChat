module.exports = function (redis_url) {
    
    if (redis_url) {
        var rtg = require('url').parse(redis_url);
        var client = require('redis').createClient(rtg.port, rtg.hostname);
        client.auth(rtg.auth.split(':')[1]);
        return client;
    }
       
    return require('redis').createClient();
};
