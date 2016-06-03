import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/inject';
import { validate } from 'ember-cli-simple-validation/mixins/validate';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import EditMixin from 'bsrs-ember/mixins/components/tab/edit';

var PREFIX = config.APP.NAMESPACE;
var DTD_URL = `${PREFIX}/dtds/`;

var GeneralSettings = Ember.Component.extend(TabMixin, EditMixin, {
  repository: inject('setting'),
  dtdRepo: inject('dtd'),
  repositoryDtd: inject('dtd'),
  classNames: ['wrapper', 'form'],
  simpleStore: Ember.inject.service(),
  dashboardTextValidation: validate('model.dashboard_text'),
  actions: {
    save() {
      this.set('submitted', true);
      this._super();
    },
    changeBool(key) {
      const store = this.get('simpleStore');
      let setting = store.find('setting', this.get('model.id'));
      setting.toggleProperty(key);
    },
    addRemoveModule(moduleKey) {
      const store = this.get('simpleStore');
      let setting = store.find('setting', this.get('model.id'));

      let init_modules = setting.get('modules');
      let modules = {
        tickets: init_modules.tickets,
        work_orders: init_modules.work_orders,
        invoices: init_modules.invoices
      };
      modules[moduleKey] = !modules[moduleKey];

      setting.set('modules', modules);
    }
  }
});

export
default GeneralSettings;