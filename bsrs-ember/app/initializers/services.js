//import TransitionService from 'bsrs-ember/service/transition';

export function initialize(container, application) {
    // application.register('transition:main', TransitionService);
    application.inject("route", "trx", "service:transition");
    application.inject("component", "trx", "service:transition");
}

export default {
    name: "services",
    initialize: initialize
};
