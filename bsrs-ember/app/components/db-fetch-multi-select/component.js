import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import { task, timeout } from 'ember-concurrency';

const DEBOUNCE_MS = 250;

var DBFetch = Ember.Component.extend({
    searchRepo: task(function * (search) {
        if (Ember.isBlank(search)) { return []; }
        yield timeout(DEBOUNCE_MS);
        const repo = this.get('repository');
        const searchRepo = this.get('searchMethod');
        const extra_params = this.get('extra_params');
        const json = yield repo[searchRepo](search, extra_params);
        return json;
    }).restartable(),
    actions: {
        selected(new_selection) {
            const model = this.get('model');
            const multi_attrs = this.get('multiAttr');
            const multi_attrs_ids = this.get('multiAttrIds');
            const old_selection = model.get(multi_attrs);
            const old_selection_ids = model.get(multi_attrs_ids);
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
        }
    }
});

export default DBFetch;

