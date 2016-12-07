import registerWithContainer from 'ember-cli-auto-register/register';

export function initialize(application) {
  registerWithContainer('deserializers', application);
  application.inject('deserializers', 'simpleStore', 'service:simpleStore');
  application.inject('deserializers', 'functionalStore', 'service:functionalStore');
}

export default {
  name: 'deserializers',
  after: 'simple-store',
  initialize: initialize
};
