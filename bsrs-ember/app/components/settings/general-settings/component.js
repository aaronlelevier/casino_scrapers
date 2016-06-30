import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/inject';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';
import ChangeBoolMixin from 'bsrs-ember/mixins/components/change-bool';

var PREFIX = config.APP.NAMESPACE;
var DTD_URL = `${PREFIX}/dtds/`;

var GeneralSettings = Ember.Component.extend(TabMixin, EditMixin, ChangeBoolMixin, {
  repository: inject('tenant'),
  dtdRepo: inject('dtd'),
  classNames: ['wrapper', 'form'],
  simpleStore: Ember.inject.service(),
  dashboardTextValidation: validate('model.dashboard_text'),
  currencyObject: Ember.computed('model.default_currency_id', function() {
    let id = this.get('model.default_currency_id');
    return this.get('simpleStore').find('currency', id);
  }),
  actions: {
    save() {
      this.set('submitted', true);
      this._super();
    },
    selected(obj){
      let model = this.get('model');
      model.set('default_currency_id', obj.get('id'));
    }
  }
});

export default GeneralSettings;