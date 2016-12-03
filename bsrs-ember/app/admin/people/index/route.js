import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var PersonIndexRoute = GridViewRoute.extend({
  i18n: Ember.inject.service(),
  repository: inject('person'),
  tabTitleCount: undefined,
  title() {
    return this.get('i18n').t('doctitle.location.index', { count: this.get('tabTitleCount') });
  },
});

export default PersonIndexRoute;
