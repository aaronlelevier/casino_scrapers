import registerWithContainer from 'ember-cli-auto-register/register';

export function initialize(container, application) {
    registerWithContainer('deserializers', application);
    application.inject('deserializers', 'store', 'store:main');
}

export default {
    name: 'deserializers',
    after: 'store',
    initialize: initialize
};
