import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
//start-non-standard
import computed from 'ember-computed-decorators';
//end-non-standard

var PriorityRouteMixin = Ember.Mixin.create({
    priorityRepository: inject('ticket-priority'),
    /*start-non-standard*/ @computed /*end-non-standard*/
    priorities() {
        return this.get('priorityRepository').fetch();
    }
});

export default PriorityRouteMixin;
