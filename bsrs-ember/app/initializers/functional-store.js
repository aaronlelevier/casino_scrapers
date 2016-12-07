export function initialize(application) {
  application.inject('route', 'functionalStore', 'service:functionalStore');
}

export default {
  name: 'functional-store',
  initialize
};
