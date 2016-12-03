import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var TicketsIndexRoute = GridViewRoute.extend({
  i18n: Ember.inject.service(),
  repository: inject('ticket'),
  tabTitleCount: undefined,
  title() {
    return this.get('i18n').t('doctitle.ticket.index', { count: this.get('tabTitleCount') });
  },
});

export default TicketsIndexRoute;
