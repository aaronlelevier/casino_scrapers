import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import windowProxy from 'bsrs-ember/utilities/window-proxy';

export default Ember.Component.extend({
    tagName: 'li',
    classNames: ['current-user t-current-user'],
    init() {
        //FIXME: change this to person that is logged in
        var firstName = 'Andier';
        var lastName = 'Krier';
        var person_id = 3;
        var name =`${firstName} ${lastName}`;
        this.set('fullName', name);
        this.set('person_id', person_id);
        this._super();
    },
    actions: {
        logout() {
            PromiseMixin.xhr('/api-auth/logout/', 'GET').then(() => {
                windowProxy.changeLocation('/login');
            });
        }
    }
});
