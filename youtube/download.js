/**
 * Created by julia on 13.09.2016.
 */
var youtubedl = require('youtube-dl');
var ytdl = require('ytdl-core');
var ffmpeg = require('fluent-ffmpeg');
var winston = require('winston');
var fs = require('fs');
var YoutubeReg = /(?:http?s?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([a-zA-Z0-9_-]+)(&.*|)/;
var download = function (url, cb) {
    let dl;
    if (YoutubeReg.test(url)) {
        dl = ytdl;
    } else {
        dl = youtubedl;
    }
    dl.getInfo(url, function (err, info) {
        if (err) return cb(err);
        if (checkTime(info)) {
            let id;
            if (YoutubeReg.test(url)) {
                id = info.video_id;
            } else {
                id = info.id;
            }
            info.id = id;
            var video;
            video = youtubedl(url, ["--restrict-filenames", "-4", "--prefer-free-formats"], {
                cwd: __dirname,
                maxBuffer: Infinity
            });
            video.on('error', function (err) {
                // console.log(err);
            });
            var filename = info.id + ".temp";
            var stream = video.pipe(fs.createWriteStream('temp/' + filename));
            video.on('info', function (info) {
                winston.info('Download started');
                winston.info('filename: ' + info._filename);
                winston.info('size: ' + info.size);
                winston.info('duration: ' + info.duration);
            });
            video.on('complete', function complete(info) {
                winston.info('filename: ' + info._filename + ' finished');
                cb(null, info);
            });
            video.on('end', function () {
                ffmpeg(fs.createReadStream('temp/' + filename)).output('./audio/' + info.id + '.mka').outputOptions(['-vn', '-acodec copy'])
                    .on('stderr', err => {

                    }).on('error', err => {
                    winston.info(err);
                    return cb(err);
                }).on('end', (stdout, stderr) => {
                    winston.info('Finished Converting');
                    fs.unlink('temp/' + filename, function (err) {
                        if (err) return cb(err);
                        cb(null, info);
                    });
                }).run();
            });
        } else {
            return cb('The Video is too long!');
        }
    });
};
var checkTime = function (info) {
    if (typeof (info.duration) === 'undefined' && typeof (info.length_seconds) === 'undefined') {
        return true;
    }
    if (typeof (info.duration) !== 'undefined') {
        let durationSplit = info.duration.split(':');
        if (parseInt(durationSplit.length) > 3) {
            return false;
        } else {
            if (durationSplit.length === 3) {
                if (parseInt(durationSplit[0]) > 1) {
                    return false;
                } else {
                    return ((parseInt(durationSplit[0]) === 1) && parseInt(durationSplit[1]) > 30)
                }
            } else {
                return true;
            }
        }
    } else {
        return (parseInt(info.length_seconds) < 5400);
    }
};
module.exports = download;