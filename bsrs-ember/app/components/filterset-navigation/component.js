import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var FilterSetNavigation = Ember.Component.extend({
    tagName: 'ul',
    repository: inject('filterset'),
    saved: Ember.computed('filtersets', 'filtersets.[]', function() {
        let route = this.get('route');
        let filtersets = this.get('filtersets');
        return filtersets.filter((filterset) => {
            return filterset.get('endpoint_name') === route;
        });
    }),
    actions: {
        removeFilterSet: function(id) {
            let repository = this.get('repository');
            repository.delete(id);
        }
    }
});

export default FilterSetNavigation;
