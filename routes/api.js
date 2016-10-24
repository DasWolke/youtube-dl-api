/**
 * Created by julia on 18.09.2016.
 */
var router = require('express').Router();
var downloader = require('../youtube/download');
var fs = require('fs');
var path = require('path');
var StatsD = require('node-dogstatsd').StatsD;
var dogstatsd = new StatsD();
var config = require('../config/main.json');
router.all('/', (req,res) => {
    return res.json({error:1, message:'Nothing here...'});
});
router.post('/api/dl', (req,res) => {
    if (req.header('auth') === config.proxy_token) {
        if (typeof (req.body.url) !== 'undefined') {
            dogstatsd.increment('musicbot.proxycall');
            downloader(req.body.url, (err,info) => {
                if (err) {
                    console.log(err);
                    return res.json({error:1, message:err});
                }
                res.json({error:0, message:'', url:req.body.url, info:info, path:`${info.id}.mka`});
                setTimeout(function () {
                    fs.unlink(path.resolve(`audio/${info.id}.mka`), (err) => {
                        if (err) return console.log(err);
                    });
                }, 1000*60*60);
            });
        } else {
            console.log(req.body);
            return res.json({error:1, message:'Missing something nyaa~'});
        }
    } else {
        return res.json({error:1, message:'Missing something...'});
    }
});
router.all('/api', (req,res) => {
    return res.json({error:1, message:'Nothing here...'});
});
module.exports = router;