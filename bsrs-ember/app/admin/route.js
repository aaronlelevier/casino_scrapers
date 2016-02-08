import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
    store: inject('main'),
    model(params) {
        let store = this.get('store');
        let settings = store.find('setting');
        let general_settings = settings.filter(function(obj) {
            return obj.name === 'general';
        })[0];
        return {
            settings_id: general_settings.get('id')
        };
    }
});
