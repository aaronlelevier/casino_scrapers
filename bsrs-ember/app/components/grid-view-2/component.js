import Ember from 'ember';
import MultiSort from 'bsrs-ember/utilities/sort';
import SortBy from 'bsrs-ember/mixins/sort-by';
import FilterBy from 'bsrs-ember/mixins/filter-by';
import UpdateFind from 'bsrs-ember/mixins/update-find';

var GridViewComponent = Ember.Component.extend(SortBy, FilterBy, UpdateFind, {
    page_sizes: ['10', '25', '50', '100'],
    toggleFilter: false,
    savingFilter: false,
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
    searched_content: Ember.computed('find', 'sort', 'page', 'search', 'model.[]', function() {
        const search = this.get('search') ? this.get('search').trim() : '';
        const regex = new RegExp(search);
        const related_fields = this.get('related_fields');
        const lookup = {};
        if(related_fields) {
            for(let i=0, len=related_fields.length; i<len; i++) {
                lookup[related_fields[i].model] = related_fields[i];
            }
        }
        let filter = this.get('searchable').map((property) => {
            return this.get('model').filter((object) => {
                let value;
                if(lookup[property]) {
                    value = object.get(property) ? object.get(property).get(lookup[property].field).toLowerCase() : null; 
                }else{
                    value = object.get(property) ? object.get(property).toLowerCase() : null;
                }
                return regex.test(value);
            });
        }.bind(this));
        return filter.reduce(function(a, b) { return a.concat(b); }).uniq();
    }),
    found_content: Ember.computed('searched_content.[]', function() {
        const find = this.get('find') || '';
        const searched_content = this.get('searched_content');
        const params = find.split(',');
        if(params[0].trim() !== '') {
            let filter = params.map((option) => {
                const property = option.split(':')[0];
                const propertyValue = option.split(':')[1];
                const findRegex = new RegExp(propertyValue);
                const related_fields = this.get('related_fields');
                var lookup = {};
                if(related_fields) {
                    for (let i=0, len=related_fields.length; i<len; i++) {
                        lookup[related_fields[i].model] = related_fields[i];
                    }
                }
                return this.get('model').filter((object) => {
                    let value;
                    if(lookup[property]) {
                        value = object.get(property) ? object.get(property).get(lookup[property].field).toLowerCase() : null;
                    }else {
                        value = object.get(property) ? object.get(property).toLowerCase() : null;
                    }
                    return findRegex.test(value);
                });
            }.bind(this));
            return filter.reduce((a,b) => {
              const one_ids = a.map(model => model.get('id'));
              const two_ids = b.map(model => model.get('id')); 
              const one_match = a.filter(item => Ember.$.inArray(item.get('id'), two_ids) > -1);
              const two_match = b.filter(item => Ember.$.inArray(item.get('id'), one_ids) > -1);
              return one_match.concat(two_match);
            }).uniq();
        }
        return searched_content;
    }),
    sorted_content: Ember.computed('found_content.[]', function() {
        const sort = this.get('sort') || '';
        let options = sort.length > 0 ? sort.split(',') : this.get('defaultSort');
        const found_content = this.get('found_content');
        let related_fields = this.get('related_fields');
        var lookup = {};
        if(related_fields) {
            for (let i=0, len=related_fields.length; i<len; i++) {
                lookup[related_fields[i].model] = related_fields[i];
            }
        }
        return MultiSort.run(found_content, options, {lookup:lookup});
    }),
    paginated_content: Ember.computed('sorted_content.[]', function() {
        const requested = this.get('requested');
        const page = parseInt(this.get('page')) || 1;
        const page_size = parseInt(this.get('page_size')) || 10;
        const pages = requested.toArray().sort((a,b) => { return a-b; }).uniq();
        const max = (pages.indexOf(page) + 1) * page_size;
        return this.get('sorted_content').slice(max-page_size, max);
    }),
    pages: Ember.computed('model.count', function() {
        const pages = [];
        const page_size = this.get('page_size') || 10;
        const total = this.get('model.count') / page_size || 1;
        for(let p=1; p <= Math.ceil(total); p++) {
            pages.push(p);
        }
        return pages;
    }),
    shown_pages: Ember.computed('pages', function() {
        const all = this.get('pages');
        const available = all.length;
        const current = parseInt(this.get('page'), 10);
        if(current > 6) {
            const max = current + 4;
            const min = current - 6;
            return max <= available ? all.slice(min, max) : all.slice(available - 10, available);
        }
        return all.slice(0, 10);
    }),
    first: Ember.computed('page', function() {
        const current = parseInt(this.get('page'), 10);
        return current === 1 ? undefined : 1;
    }),
    last: Ember.computed('page', 'pages', function() {
        const available = this.get('pages').length;
        const current = parseInt(this.get('page'), 10);
        return current !== available ? available : undefined;
    }),
    next: Ember.computed('page', 'pages', function() {
        const available = this.get('pages').length;
        const current = parseInt(this.get('page'), 10);
        const next = current + 1;
        return next <= available ? next : undefined;
    }),
    previous: Ember.computed('page', function() {
        const previous = this.get('page') - 1;
        return previous > 0 ? previous : undefined;
    }),
    notNext: Ember.computed.not('next'),
    notPrevious: Ember.computed.not('previous'),
    notFirst: Ember.computed.not('first'),
    notLast: Ember.computed.not('last'),
    actions: {
        keyup(search) {
            this.setProperties({page: 1, search: search});
        },
        sortBy(column) {
            const current = this.get('sort');
            const sorted = this.reorder(current, column);
            this.setProperties({page: 1, sort: sorted});
        },
        toggleFilterModal(column) {
            this.toggle(column);
        },
        togglePageSize(page_size) {
            this.setProperties({page: 1, page_size: page_size});
        },
        resetGrid() {
            this.setProperties({page: 1, sort: undefined, find: undefined, search: undefined});
        },
        toggleSaveFilterSetModal() {
            this.toggleProperty('savingFilter');
        },
        invokeSaveFilterSet() {
            this.attrs.save_filterset(this.get('filtersetName'));
            this.toggleProperty('savingFilter');
            this.set('filtersetName', '');
        }
    }
});

export default GridViewComponent;
