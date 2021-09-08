#!/usr/bin/env node

/**
 * tw-energy
 * Get the current energy generation data for Taiwan.
 *
 * @author Fershad Irani <https://fershad.com>
 */

const init = require('./utils/init');
const cli = require('./utils/cli');
const log = require('./utils/log');
const get = require('./utils/get');
// const inquirer = require('inquirer');

const input = cli.input;
const flags = cli.flags;
const { clear, debug } = flags;

(async () => {
	init({ clear });
	input.includes(`help`) && cli.showHelp(0);

	debug && log(flags);

	get();
})();