import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
    // store: injectStore('main'),
    model(params){
        let model = {id: "b783a238-1131-4623-8d24-81a672bb4e00"}
        return model;
    }

});
