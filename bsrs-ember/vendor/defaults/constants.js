/*global module*/
// copy of bsrs-ember/utilities/constants

var resources = 'ticket person role location locationlevel category workorder';
var prefixes = 'view add change delete';

var exports = module.exports = {};

exports.RESOURCES_WITH_PERMISSION = resources.split(' ');
exports.PERMISSION_PREFIXES = prefixes.split(' ');
