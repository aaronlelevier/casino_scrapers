import Ember from 'ember';
import PromiseMixin from 'bsrs-ember/mixins/promise';

export default Ember.Component.extend({
    tagName: 'li',
    classNames: ['current-user t-current-user'],
    init() {
        //TODO: change this to person that is logged in
        var firstName = 'Andier';
        var lastName = 'Krier';
        var person_id = 3;
        var name = firstName + ' ' + lastName;
        this.set('fullName', name);
        this.set('person_id', person_id);
        this._super();
    },
    actions: {
        logout() {
            PromiseMixin.xhr('api-auth/logout', 'POST');
        }
    }
});
