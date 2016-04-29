import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import NewMixin from 'bsrs-ember/mixins/model/new';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import OptConf from 'bsrs-ember/mixins/optconfigure/third-party';

const { run } = Ember;

var ThirdPartyModel = Model.extend(NewMixin, OptConf, {
  init() {
    belongs_to.bind(this)('status', 'third-party', {'dirty':true});
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
      let status = this.get('status');
      let status_fk = this.get('status_fk');
      if (typeof status === 'object') {
          return status.get('id') === status_fk ? false : true;
      }
  }),
  // saveStatus: belongs_to_save('third-party', 'status', 'status_fk'),
  saveRelated() {
    this.saveStatus();
  },
  rollback() {
    this.rollbackStatus();
    this._super();
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
