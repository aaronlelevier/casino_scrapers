import registerWithContainer from 'ember-cli-auto-register/register';

export function initialize() {
    var application = arguments[1] || arguments[0];
    registerWithContainer('deserializers', application);
    application.inject('deserializers', 'simpleStore', 'service:simpleStore');
}

export default {
    name: 'deserializers',
    after: 'simple-store',
    initialize: initialize
};
