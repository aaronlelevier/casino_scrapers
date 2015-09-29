import Ember from 'ember';
import MultiSort from 'bsrs-ember/utilities/sort';
import SortBy from 'bsrs-ember/mixins/sort-by';
import FilterBy from 'bsrs-ember/mixins/filter-by';
import UpdateFind from 'bsrs-ember/mixins/update-find';

var GridViewComponent = Ember.Component.extend(FilterBy, UpdateFind, SortBy, {
    page_sizes: ['10', '25', '50', '100'],
    toggleFilter: false,
    classNames: ['wrapper'],
    eventbus: Ember.inject.service(),
    _setup: Ember.on('init', function() {
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
        let sort = this.get('sort') || '';
        let options = sort.length > 0 ? sort.split(',') : this.get('defaultSort');
        let found_content = this.get('found_content');
        return MultiSort.run(found_content, options);
    }),
    paginated_content: Ember.computed('sorted_content.[]', function() {
        var page = parseInt(this.get('page')) || 1;
        var page_size = this.get('page_size') || 10;
        var upperBound = (page * page_size);
        var lowerBound = (page * page_size) - page_size;
        return this.get('sorted_content').slice(lowerBound, upperBound);
    }),
    pages: Ember.computed('model.count', function() {
        var pages = [];
        var page_size = this.get('page_size') || 10;
        var total = this.get('model.count') / page_size || 1;
        for(var p=1; p <= Math.ceil(total); p++) {
            pages.push(p);
        }
        return pages;
    }),
    shown_pages: Ember.computed('pages', 'page', function() {
        let all = this.get('pages');
        let available = all.length;
        let current = parseInt(this.get('page'), 10);
        if(current > 6) {
            let max = current + 4;
            let min = current - 6;
            return max <= available ? all.slice(min, max) : all.slice(available - 10, available);
        }
        return all.slice(0, 10);
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
        },
        togglePageSize: function(page_size) {
            this.setProperties({page: 1, page_size: page_size});
        },
        resetGrid: function() {
            this.setProperties({page: 1, sort: undefined, find: undefined, search: undefined});
        }
    }
});

export default GridViewComponent;
