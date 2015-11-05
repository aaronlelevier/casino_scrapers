import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import inject from 'bsrs-ember/utilities/store';

var ThirdPartyModel = Model.extend({
    store: inject('main'),
    name: attr(),
    number: attr(),
    status: attr(),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', function() {
        return this.get('isDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    rollbackRelated() {
        // purposely left blank, no related objects
    },
    removeRecord() {
        this.get('store').remove('third-party', this.get('id'));
    },
    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
            number: this.get('number'),
            status: this.get('status')
        };
    },
});

export default ThirdPartyModel;
