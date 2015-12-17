import Ember from 'ember';

function equal(first, second) {
    return Ember.$(first).not(second).get().length === 0 && Ember.$(second).not(first).get().length === 0;
}

var MultiSort = Ember.Object.extend().reopenClass({
    run: function(items, options) {
        let size = MultiSort.size(options);
        let operations = MultiSort.transform(options);
        return items.sort(function(a, b) {
            let sorted = 0, pass = 0;
            while(sorted === 0 && pass < size){
                let sortBy = MultiSort.precedence(operations, pass);
                let direction = operations[sortBy];
                sorted = MultiSort.sort(a, b, direction, sortBy);
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
    sort: function(a, b, d, column) {
        if(column.indexOf('[') > 0) {
            const attr = column.match(/^([^\[]+).(\w+)/);
            let one = Ember.get(a, attr[1]) || [];
            let two = Ember.get(b, attr[1]) || [];
            return MultiSort.sortArray(one, two, d, attr[2]);
        }
        return MultiSort.sortObject(a, b, d, column);
    },
    sortArray: function(one, two, d, column) {
        let size_one = one.get('length');
        let size_two = two.get('length');
        if(size_two < size_one) {
            return 1 * d;
        }
        let sorted_array = [one, two].sort(function(a, b) {
            let sorted = 0, pass = 0;
            while(sorted === 0 && pass < size_one){
                let _a = a[pass];
                let _b = b[pass];
                sorted = MultiSort.sortObject(_a, _b, d, column);
                pass++;
            }
            return sorted;
        });
        if (equal(sorted_array.objectAt(0), one)) {
            return 0;
        }
        return 1 * d;
    },
    sortObject: function(a, b, d, column) {
        let _a = Ember.get(a, column) || '';
        let _b = Ember.get(b, column) || '';
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
