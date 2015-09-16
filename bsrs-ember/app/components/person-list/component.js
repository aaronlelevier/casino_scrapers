import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import MultiSort from 'bsrs-ember/utilities/sort';
import SortBy from 'bsrs-ember/mixins/sort-by';
import FilterBy from 'bsrs-ember/mixins/filter-by';
import UpdateFind from 'bsrs-ember/mixins/update-find';

export default Ember.Component.extend(FilterBy, UpdateFind, SortBy, {
    itemsPerPage: 10,
    toggleFilter: false,
    classNames: ['wrapper'],
    searchable: ['username', 'fullname', 'title'],
    eventbus: Ember.inject.service(),
    _setup: Ember.on('init', function() {
        this.set('filterModel', Ember.Object.create()); //TODO: push this down each time from the route
        this.get('eventbus').subscribe('bsrs-ember@component:input-dynamic-filter:', this, 'onValueUpdated');
    }),
    _teardown: Ember.on('willDestroyElement', function() {
        this.get('eventbus').unsubscribe('bsrs-ember@component:input-dynamic-filter:');
    }),
    onValueUpdated: function(input, eventName, column, value) {
        this.set('find', this.update_find_query(column, value, this.get('find')));
    },
    searched_content: Ember.computed('find', 'page', 'sort', 'search', 'model.[]', function() {
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
    found_content: Ember.computed('searched_content.[]', function() {
        let find = this.get('find') || '';
        let searched_content = this.get('searched_content');
        let params = find.split(',');
        if(params[0].trim() !== '') {
            let filter = params.map(function(option) {
                let property = option.split(':')[0];
                let propertyValue = option.split(':')[1];
                let findRegex = new RegExp(propertyValue);
                return this.get('model').filter(function(object) {
                    var value = object.get(property) ? object.get(property).toLowerCase() : null;
                    return findRegex.test(value);
                });
            }.bind(this));
            return filter.reduce(function(a, b) {
                let one_ids = a.map(function(model) { return model.get('id'); });
                let two_ids = b.map(function(model) { return model.get('id'); });
                let one_match = a.filter(function(item) {
                    return Ember.$.inArray(item.get('id'), two_ids) > -1;
                });
                let two_match = b.filter(function(item) {
                    return Ember.$.inArray(item.get('id'), one_ids) > -1;
                });
                return one_match.concat(two_match);
            }).uniq();
        }
        return searched_content;
    }),
    sorted_content: Ember.computed('found_content.[]', function() {
        let sort = this.get('sort') || 'id';
        let options = sort.split(',');
        let found_content = this.get('found_content');
        return MultiSort.run(found_content, options);
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
    first: Ember.computed('page', function() {
        let current = parseInt(this.get('page'), 10);
        return current === 1 ? undefined : 1;
    }),
    last: Ember.computed('page', 'pages', function() {
        let available = this.get('pages').length;
        let current = parseInt(this.get('page'), 10);
        return current !== available ? available : undefined;
    }),
    next: Ember.computed('page', 'pages', function() {
        let available = this.get('pages').length;
        let current = parseInt(this.get('page'), 10);
        let next = current + 1;
        return next <= available ? next : undefined;
    }),
    previous: Ember.computed('page', function() {
        let previous = this.get('page') - 1;
        return previous > 0 ? previous : undefined;
    }),
    notNext: Ember.computed.not('next'),
    notPrevious: Ember.computed.not('previous'),
    notFirst: Ember.computed.not('first'),
    notLast: Ember.computed.not('last'),
    actions: {
        keyup: function(search) {
            this.setProperties({page: 1, search: search});
        },
        sortBy: function(column) {
            let current = this.get('sort');
            let sorted = this.reorder(current, column);
            this.setProperties({page: 1, sort: sorted});
        },
        toggleFilterModal: function(column) {
            this.toggle(column);
        }
    }
});
