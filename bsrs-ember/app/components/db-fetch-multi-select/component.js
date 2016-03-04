import Ember from 'ember';
import config from 'bsrs-ember/config/environment';

var DBFetch = Ember.Component.extend({
    actions: {
        selected(new_selection) {
            const model = this.get('model');
            const multi_attrs = this.get('multiAttr');
            const old_selection = model.get(`${multi_attrs}s`);
            const old_selection_ids = model.get(`${multi_attrs}_ids`);
            const new_selection_ids = new_selection.mapBy('id');
            const add_func = this.get('add_func');
            const remove_func = this.get('remove_func');
            new_selection.forEach((new_model) => {
                if(Ember.$.inArray(new_model.id, old_selection_ids) < 0) {
                    model[add_func](new_model);
                }
            });
            old_selection.forEach((old_model) => {
                if(Ember.$.inArray(old_model.get('id'), new_selection_ids) < 0){
                    model[remove_func](old_model.get('id'));
                }
            });
        },
        update_filter(search) {
            const repo = this.get('repository');
            const searchRepo = this.get('searchRepo');
            const extra_params = this.get('extra_params');
            return new Ember.RSVP.Promise((resolve, reject) => {
                Ember.run.later(() => {
                    if (Ember.isBlank(search)) { return resolve([]); }
                    resolve(repo[searchRepo](search, extra_params));
                }, config.DEBOUNCE_TIMEOUT_INTERVAL);
            });
        }
    }
});

export default DBFetch;

