import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import ChangeBoolMixin from 'bsrs-ember/mixins/components/change-bool';

var GeneralSettings = Ember.Component.extend(TabMixin, EditMixin, ChangeBoolMixin, {
  init() {
    this._super(...arguments);
    this.didValidate = false;
  },
  repository: inject('tenant'),
  dtdRepo: inject('dtd'),
  classNames: ['wrapper', 'form'],
  simpleStore: Ember.inject.service(),
  currencyObject: Ember.computed('model.default_currency_id', function() {
    let id = this.get('model.default_currency_id');
    return this.get('simpleStore').find('currency', id);
  }),
  actions: {
    save() {
      if (this.get('model.validations.isValid')) {
        this._super(...arguments);
      }
      this.set('didValidate', true);
    }
  }
});

export default GeneralSettings;
