import Ember from 'ember';
const { w } = Ember.String;

let resources = 'ticket person role location locationlevel category workorder';
let prefixes = 'view add change delete';

/* constants */
export let RESOURCES_WITH_PERMISSION = w(resources);
export let PERMISSION_PREFIXES = w(prefixes);
