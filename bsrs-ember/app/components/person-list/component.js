import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var get = Ember.get, set = Ember.set;

export default Ember.Component.extend({
    query_page: 1,
    query_sort: 'id',
    query_search: '',
    itemsPerPage: 10,
    searchable: ['first_name', 'title'],
    classNames: ['wrapper'],
    repository: inject('person'),
    query_django: function(search) {
        var sort = this.get('sort') || 'id';
        var page = parseInt(this.get('page')) || 1;
        var repository = this.get('repository');
        if(this.get('query_page') !== page || this.get('query_sort') !== sort || this.get('query_search') !== search) {
            if(this.get('query_page') === page) {
                page = 1;
                this.set('page', 1);
            }
            this.set('query_page', page);
            this.set('query_sort', sort);
            this.set('query_search', search);
            repository.findWithQuery(page, sort, search);
        }
    },
    searched_content: Ember.computed('search', 'model.model.[]', function() {
        var search = this.get('search') ? this.get('search').trim() : '';
        this.query_django(search);
        var regex = new RegExp(search);
        var filter = this.get('searchable').map(function(property) {
            return this.get('model.model').filter(function(object) {
                var value = object.get(property).toLowerCase();
                return regex.test(value);
            });
        }.bind(this));
        return filter.reduce(function(a, b) { return a.concat(b); }).uniq();
    }),
    sorted_content: Ember.computed('sort', 'searched_content.[]', function() {
        var sort = this.get('sort') || 'id';
        return this.get('searched_content').toArray().sort(function(a,b) {
            return Ember.compare(get(a, sort), get(b, sort));
        });
    }),
    paginated_content: Ember.computed('page', 'sorted_content.[]', function() {
        var page = parseInt(this.get('page')) || 1;
        var itemsPerPage = this.get('itemsPerPage');
        var upperBound = (page * itemsPerPage);
        var lowerBound = (page * itemsPerPage) - itemsPerPage;
        return this.get('sorted_content').slice(lowerBound, upperBound);
    }),
    pages: Ember.computed('paginated_content.[]', function() {
        var pages = [];
        var total = this.get('model.model.count') / this.get('itemsPerPage') || 1;
        for(var p=1; p <= Math.ceil(total); p++) {
            pages.push(p);
        }
        return pages;
    }),
    actions: {
        keyup: function(search) {
            this.set('search', search);
        }
    }
});
