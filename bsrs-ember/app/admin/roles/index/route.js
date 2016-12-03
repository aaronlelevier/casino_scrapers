import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var RolesIndexRoute = GridViewRoute.extend({
  i18n: Ember.inject.service(),
  repository: inject('role'),
  tabTitleCount: undefined,
  title() {
    return this.get('i18n').t('doctitle.role.index', { count: this.get('tabTitleCount') });
  },
});

export default RolesIndexRoute;
