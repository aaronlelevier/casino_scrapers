import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import { ValidationMixin, validate } from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import ChangeBoolMixin from 'bsrs-ember/mixins/components/change-bool';

var GeneralSettings = Ember.Component.extend(TabMixin, EditMixin, ChangeBoolMixin, ValidationMixin, {
  repository: inject('tenant'),
  dtdRepo: inject('dtd'),
  classNames: ['wrapper', 'form'],
  simpleStore: Ember.inject.service(),
  companyNameValidation: validate('model.company_name'),
  companyCodeValidation: validate('model.company_code'),
  dashboardTextValidation: validate('model.dashboard_text'),
  currencyObject: Ember.computed('model.default_currency_id', function() {
    let id = this.get('model.default_currency_id');
    return this.get('simpleStore').find('currency', id);
  }),
  actions: {
    save() {
      this.set('submitted', true);
      if (this.get('valid')) {
        this._super();
      }
    }
  }
});

export default GeneralSettings;