import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/store';
import { attr, Model } from 'ember-cli-simple-store/model';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
    key: validator('presence', {
        presence: true,
        message: 'Key must be provided'
    }),
});

var DTDModel = Model.extend(Validations, {
    store: inject('main'),
    key: attr(''),
    description: attr(''),
    note: attr(''),
    note_type: attr(''),
    prompt: attr(''),
    link_type: attr(''),
    isDirtyOrRelatedDirty: Ember.computed('isDirty', function() {
        return this.get('isDirty');
    }),
    isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
    serialize(){
        return {
            id: this.get('id'),
            key: this.get('key'),
            description: this.get('description'),
            prompt: this.get('prompt'),
            note: this.get('note'),
            note_type: this.get('note_type'),
            link_type: this.get('link_type'),
        };
    },
    rollbackRelated() {
    },
    saveRelated(){
    },
    removeRecord(){
        run(() => {
            this.get('store').remove('dtd', this.get('id'));
        });
    },
});


export default DTDModel;

