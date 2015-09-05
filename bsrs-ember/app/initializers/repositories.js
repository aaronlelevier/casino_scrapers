import registerWithContainer from 'ember-cli-auto-register/register';

export function initialize(application) {
    registerWithContainer('repositories', application);
    application.inject('repositories', 'store', 'store:main');
}

export default {
    name: 'repositories',
    after: 'store',
    initialize: initialize
};
