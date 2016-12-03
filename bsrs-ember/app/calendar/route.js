import Ember from 'ember';

export default Ember.Route.extend({
  i18n: Ember.inject.service(),
  title() {
    return this.get('i18n').t('doctitle.calendar.index');
  },
});
