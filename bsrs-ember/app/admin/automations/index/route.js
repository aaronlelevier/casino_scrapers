import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

export default GridViewRoute.extend({
  i18n: Ember.inject.service(),
  repository: inject('automation'),
  tabTitleCount: undefined,
  title() {
    return this.get('i18n').t('doctitle.automation.index', { count: this.get('tabTitleCount') });
  },
});
