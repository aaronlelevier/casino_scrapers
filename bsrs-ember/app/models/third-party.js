import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';
import StatusMixin from 'bsrs-ember/mixins/model/status';

var run = Ember.run;

var ThirdPartyModel = Model.extend(StatusMixin, {
    type: 'third-party',
    store: inject('main'),
    name: attr(),
    number: attr(),
    status_fk: undefined,
    isDirtyOrRelatedDirty: Ember.computed('isDirty', 'statusIsDirty', function() {
        return this.get('isDirty') || this.get('statusIsDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    saveRelated() {
        this.saveStatus();
    },
    rollbackRelated() {
        this.rollbackStatus();
    },
    removeRecord() {
        const pk = this.get('id');
        const store = this.get('store');
        run(function() {
            store.remove('third-party', pk);
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
