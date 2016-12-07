import registerWithContainer from 'ember-cli-auto-register/register';

export function initialize(application) {
  registerWithContainer('repositories', application);
  application.inject('repositories', 'simpleStore', 'service:simpleStore');
  application.inject('repositories', 'functionalStore', 'service:functionalStore');
}

export default {
  name: 'repositories',
  after: 'simple-store',
  initialize: initialize
};
