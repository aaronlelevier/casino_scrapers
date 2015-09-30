import Ember from 'ember';

var FilterSet = Ember.Object.extend({
    query: Ember.computed('endpoint_uri', function() {
        let query = {};
        let endpoint_uri = this.get('endpoint_uri').replace('?', '');
        endpoint_uri.split('&').forEach(function(item) {
            let param = item.split('=');
            let value = param[1];
            let options = value && decodeURIComponent(value);
            query[param[0]] = options;
        });
        return query;
    }),
    params: Ember.computed('query', function() {
        return Ember.Object.create({
            isQueryParams: true,
            values: this.get('query')
        });
    })
});

export default FilterSet;
