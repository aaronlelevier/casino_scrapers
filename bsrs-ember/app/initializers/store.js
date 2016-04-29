import Store from 'ember-cli-simple-store/store';

export function initialize() {
  var application = arguments[1] || arguments[0];
  application.register('service:simpleStore', Store);
  application.inject('controller', 'simpleStore', 'service:simpleStore');
  application.inject('route', 'simpleStore', 'service:simpleStore');
}

export default {
  name: 'simple-store',
  initialize: initialize
};
