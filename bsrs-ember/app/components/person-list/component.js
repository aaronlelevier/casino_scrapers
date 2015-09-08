import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var get = Ember.get, set = Ember.set;

export default Ember.Component.extend({
    itemsPerPage: 10,
    searchable: ['first_name', 'title'],
    classNames: ['wrapper'],
    searched_content: Ember.computed('page', 'sort', 'search', 'model.[]', function() {
        var search = this.get('search') ? this.get('search').trim() : '';
        var regex = new RegExp(search);
        var filter = this.get('searchable').map(function(property) {
            return this.get('model').filter(function(object) {
                var value = object.get(property) ? object.get(property).toLowerCase() : null;
                return regex.test(value);
            });
        }.bind(this));
        return filter.reduce(function(a, b) { return a.concat(b); }).uniq();
    }),
    sorted_content: Ember.computed('searched_content.[]', function() {
        var ordering = this.get('sort') || 'id';
        return this.get('searched_content').sort(function(a,b) {
            return Ember.compare(get(a, ordering), get(b, ordering));
        });
    }),
    paginated_content: Ember.computed('sorted_content.[]', function() {
        var page = parseInt(this.get('page')) || 1;
        var itemsPerPage = this.get('itemsPerPage');
        var upperBound = (page * itemsPerPage);
        var lowerBound = (page * itemsPerPage) - itemsPerPage;
        return this.get('sorted_content').slice(lowerBound, upperBound);
    }),
    pages: Ember.computed('model.count', function() {
        var pages = [];
        var total = this.get('model.count') / this.get('itemsPerPage') || 1;
        for(var p=1; p <= Math.ceil(total); p++) {
            pages.push(p);
        }
        return pages;
    }),
    actions: {
        keyup: function(search) {
            this.setProperties({page: 1, search: search});
        }
    }
});
