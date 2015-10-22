import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';

var ThirdPartyModel = Model.extend({
    name: attr(),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', function() {
        return this.get('isDirty');
    }),
    serialize() {
        return {
            id: this.get('id'),
            name: this.get('name'),
            number: this.get('number'),
            status: this.get('status')
        };
    },
    rollbackRelated() {
        // purposely left blank, no related objects
    },
});

export default ThirdPartyModel;
