export function initialize(application) {
  application.inject('route', 'trx', 'service:transition');
  application.inject('component', 'trx', 'service:transition');
  application.inject('controller', 'trx', 'service:transition');
}

export default {
  name: 'services',
  initialize: initialize
};
