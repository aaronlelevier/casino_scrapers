import Ember from 'ember';

var FilterBy = Ember.Mixin.create({
    toggle: function(column) {
        let css_column = column ? column.replace('_', '-') : '';
        if(column && this.get('toggleFilter')) {
            if('.t-filter-' + css_column !== this.get('targetFilter')) {
                Ember.run.later(() => {
                    this.toggleProperty('toggleFilter');
                }, 0);
            }
        }
        this.set('filterField', column);
        this.toggleProperty('toggleFilter');
        this.set('filterPlaceholder', 'Search ' + column);
        this.set('targetFilter', '.t-filter-' + css_column);
        this.set('page', 1);
    }
});

export default FilterBy;
