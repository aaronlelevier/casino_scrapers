import registerWithContainer from "ember-cli-auto-register/register";

export function initialize(container, application) {
    registerWithContainer("repositories", application);
    application.inject("repositories", "store", "store:main");
    //application.inject('route:person', 'transition', 'service:');
}

export default {
    name: "repositories",
    after: "store",
    initialize: initialize
};
