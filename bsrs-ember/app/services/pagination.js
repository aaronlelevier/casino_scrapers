import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Service.extend({
    store: inject('main'),
    requested: function(name, page) {
        let store = this.get('store');
        let pagination = store.push('pagination', {id: name}).get('pages');
        pagination.pushObject(page);
        return pagination;
    }
});
