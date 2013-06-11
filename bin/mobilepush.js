#!/usr/bin/env node
/**
 * Created with JetBrains WebStorm.
 * User: smile
 * Date: 14/06/13
 * Time: 15:45
 * To change this template use File | Settings | File Templates.
 */

var config = require('../lib/Config'),
    web = require('../lib/Web'),
    pack = require('../package'),
    program = require('commander'),
    fs = require('fs'),
    path = require('path');

// TODO: cli mode
program.version(pack.version)
    .option("-c --config <configPath>", "Path to config file")
    .parse(process.argv);

var configPath = program.config;
if (configPath) {
    configPath = configPath.indexOf('/') === 0 ? configPath : path.join(process.cwd(), configPath);
    if (!fs.existsSync(configPath)) {
        program.outputHelp();
        throw new Error('Cannot find config file: ' + configPath);
    }
} else {
    program.outputHelp();
    throw new Error('Expected config file');
}

config.initialize(configPath);
web.start();