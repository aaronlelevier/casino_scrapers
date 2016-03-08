import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
//start-non-standard
import computed from 'ember-computed-decorators';
//end-non-standard

var StatusRouteMixin = Ember.Mixin.create({
    statusRepository: inject('ticket-status'),
    /*start-non-standard*/ @computed /*end-non-standard*/
    priorities() {
        return this.get('statusRepository').fetch();
    }
});

export default StatusRouteMixin;
