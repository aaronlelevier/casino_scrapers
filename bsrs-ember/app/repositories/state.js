import Ember from 'ember';
import config from 'bsrs-ember/config/environment';

export default Ember.Object.extend({
    find() {
        var store = this.get('store');
        return store.find("state");
    }
});
