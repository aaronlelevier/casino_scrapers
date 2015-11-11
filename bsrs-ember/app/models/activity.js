import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

var ActivityModel = Ember.Object.extend({
    store: inject('main'),
    to: Ember.computed('belongs_to.[]', function() {
        return this.get('belongs_to').objectAt(0);
    }),
    belongs_to: Ember.computed('to_fk', function() {
        const type = this.get('type');
        const to_fk = this.get('to_fk');
        const filter = function(dynamic) {
            return dynamic.get('id') === to_fk;
        };
        return this.get('store').find(`activity/${type}`, filter, []);
    }),
    from: Ember.computed('belongs_from.[]', function() {
        return this.get('belongs_from').objectAt(0);
    }),
    belongs_from: Ember.computed('from_fk', function() {
        const type = this.get('type');
        const from_fk = this.get('from_fk');
        const filter = function(dynamic) {
            return dynamic.get('id') === from_fk;
        };
        return this.get('store').find(`activity/${type}`, filter, []);
    }),
    person: Ember.computed('belongs_person.[]', function() {
        return this.get('belongs_person').objectAt(0);
    }),
    belongs_person: Ember.computed('person_fk', function() {
        const person_fk = this.get('person_fk');
        const filter = function(person) {
            return person.get('id') === person_fk;
        };
        return this.get('store').find(`activity/person`, filter, []);
    })
});

export default ActivityModel;
