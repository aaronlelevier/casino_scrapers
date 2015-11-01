import Ember from 'ember';

var MultiSort = Ember.Object.extend().reopenClass({
    run: function(items, options, related_fields) {
        let size = MultiSort.size(options);
        let operations = MultiSort.transform(options);
        return items.sort(function(a, b) {
            let sorted = 0, pass = 0;
            while(sorted === 0 && pass < size){
                let sortBy = MultiSort.precedence(operations, pass);
                let direction = operations[sortBy];
                sorted = MultiSort.sort(a, b, direction, sortBy, related_fields);
                pass++;
            }
            return sorted;
        });
    },
    size: function(obj) {
        let size = 0, key = 0;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                size++;
            }
        }
        return size;
    },
    transform: function(options) {
        let operations = {};
        options.forEach(function(option) {
            let key = option.replace('-', '');
            operations[key] = option.match(/[-]/) ? -1 : 1;
        });
        return operations;
    },
    precedence: function(obj, pass) {
        let size = 0, key = 0;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (size === pass) {
                    return key;
                }
                size++;
            }
        }
    },
    sort: function(a, b, d, column, related_fields) {
        let _a;
        let _b;
        if(related_fields && related_fields.lookup[column]) {
            let field = `${column}.${related_fields.lookup[column].field}`;
            _a = Ember.get(a, field) || '';
        }else{
            _a = Ember.get(a, column) || '';
        }
        if(related_fields && related_fields.lookup[column]) {
            _b = Ember.get(b, `${column}.${related_fields.lookup[column].field}`) || '';
        }else{
            _b = Ember.get(b, column) || '';
        }
        d = d !== null ? d : 1;
        a = MultiSort.isNumber(_a) ? _a*1 : _a.toLowerCase();
        b = MultiSort.isNumber(_b) ? _b*1 : _b.toLowerCase();
        if (a === b) {
            return 0;
        }
        return a > b ? 1 * d : -1 * d;
    },
    isNumber: function(number){
        let value = parseInt(number, 10);
        if (value && value.toString().length === number.toString().length) {
            return !isNaN(value);
        }
        return false;
    }
});

export default MultiSort;
