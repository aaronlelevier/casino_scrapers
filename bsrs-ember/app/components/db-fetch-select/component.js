import Ember from 'ember';
import config from 'bsrs-ember/config/environment';

var DBFetch = Ember.Component.extend({
    actions: {
        selected(item) {
            const model = this.get('model');
            const change_func = this.get('change_func');
            const remove_func = this.get('remove_func');
            if (item) {
                model[change_func](item);
            } else {
                model[remove_func]();
            }
        },
        update_filter(search) {
            const repo = this.get('repository');
            const searchRepo = this.get('searchRepo');
            return new Ember.RSVP.Promise((resolve, reject) => {
                Ember.run.later(() => {
                    if (Ember.isBlank(search)) { return resolve([]); }
                    resolve(repo[searchRepo](search));
                }, config.DEBOUNCE_TIMEOUT_INTERVAL);
            });
        }
    }
});

export default DBFetch;

