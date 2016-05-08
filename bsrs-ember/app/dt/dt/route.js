import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import FindById from 'bsrs-ember/mixins/route/findById';

var DTRoute = Ember.Route.extend(FindById, {
  repository: inject('dtd'),
  ticketRepository: inject('ticket'),
  model(params) {
    const pk = params.dt_id;
    const ticket_id = params.ticket_id;
    const repository = this.get('repository');
    return new Ember.RSVP.Promise((resolve, reject) => {
      this.get('repository').deepLinkDT(pk, ticket_id).then(({model, ticket}) => {
        resolve({model, ticket});
      });
    });
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  },
});

export default DTRoute;
