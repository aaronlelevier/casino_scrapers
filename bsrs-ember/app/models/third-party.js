import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import NewMixin from 'bsrs-ember/mixins/model/new';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import OptConf from 'bsrs-ember/mixins/optconfigure/third-party';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  name: validator('presence', {
    presence: true,
    message: 'errors.third_party.name'
  }),
  number: validator('presence', {
    presence: true,
    message: 'errors.third_party.number'
  }),
});

var ThirdPartyModel = Model.extend(NewMixin, Validations, OptConf, {
  init() {
    belongs_to.bind(this)('status', 'third-party', {bootstrapped:true, 'dirty':true});
    this._super(...arguments);
  },
  type: 'third-party',
  simpleStore: Ember.inject.service(),
  name: attr(),
  number: attr(),
  status_fk: undefined,
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'statusIsDirty', function() {
    return this.get('isDirty') || this.get('statusIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  statusIsDirty: Ember.computed('status', 'status_fk', function() {
    const { status, status_fk } = this.getProperties('status', 'status_fk');
    if (typeof status === 'object') {
      return status.get('id') === status_fk ? false : true;
    }
  }),
  saveRelated() {
    this.saveStatus();
  },
  rollback() {
    this.rollbackStatus();
    this._super(...arguments);
  },
  removeRecord() {
    run(() => {
      this.get('simpleStore').remove('third-party', this.get('id'));
    });
  },
  serialize() {
    return {
      id: this.get('id'),
      name: this.get('name'),
      number: this.get('number'),
      status: this.get('status').get('id')
    };
  },
});

export default ThirdPartyModel;
