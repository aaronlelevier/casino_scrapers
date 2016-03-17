import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import StatusMixin from 'bsrs-ember/mixins/model/status';
import NewMixin from 'bsrs-ember/mixins/model/new';
import { belongs_to_save } from 'bsrs-components/attr/belongs-to';

const { run } = Ember;

var ThirdPartyModel = Model.extend(NewMixin, StatusMixin, {
  type: 'third-party',
  store: inject('main'),
  name: attr(),
  number: attr(),
  status_fk: undefined,
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'statusIsDirty', function() {
    return this.get('isDirty') || this.get('statusIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  saveStatus: belongs_to_save('third-party', 'status', 'status_fk'),
  saveRelated() {
    this.saveStatus();
  },
  rollback() {
    this.rollbackStatus();
    this._super();
  },
  removeRecord() {
    run(() => {
      this.get('store').remove('third-party', this.get('id'));
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
