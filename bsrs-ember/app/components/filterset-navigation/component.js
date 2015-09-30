import Ember from 'ember';

var FilterSetNavigation = Ember.Component.extend({
    tagName: 'li',
    saved: Ember.computed('filtersets.[]', function() {
        //TDD that the cache string will truly SHOW when new items are added
        let route = this.get('route');
        let filtersets = this.get('filtersets');
        return filtersets.filter((filterset) => {
            return filterset.get('endpoint_name') === route;
        });
    })
});

export default FilterSetNavigation;
