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
    }
  }
});

export
default GeneralSettings;