var BSRS_LIST_FIXTURE_MIXIN = (function() {
    var factory = function() {
    };

    factory.prototype.empty = function() {
        return {'count':0,'next':null,'previous':null,'results': []};
    };

    factory.prototype.paginated = function(page_size) {
        var page1 = this.list_two().results;
        var page2 = this.list().results;
        var response = page1.concat(page2);
        var sorted = response.sort(function(a,b) {
            return a['id'] - b['id'];
        });
        var paginated;
        if(page_size > 10) {
            paginated = sorted;
        }else{
            paginated = sorted.slice(0, 10);
        }
        return {'count':18,'next':null,'previous':null,'results': paginated};
    };

    factory.prototype.sorted = function(column) {
        var page1 = this.list_two().results;
        var page2 = this.list().results;
        var response = page1.concat(page2);
        var columns = column.split(',');
        var column = columns[0];
        var sorted = response.sort(function(a,b) {
            if(column.match(/[-]/)) {
                return a[column] - b[column];
            }else{
                return b[column] - a[column];
            }
            //we do a reverse order sort here to verify a real sort occurs in the component
        });
        if(columns.length === 2) {
            sorted = response.sort(function(a,b) {
                return b[columns[1]] - a[columns[1]];
            });
        }

        return {'count':sorted.length,'next':null,'previous':null,'results': sorted};
    };

    factory.prototype.fulltext = function(find, page) {
        var page1 = this.list_two().results;
        var page2 = this.list().results;
        var response = page1.concat(page2);
        var sorted = response.sort(function(a,b) {
            return a['id'] - b['id'];
        });
        var params = find.split(',');
        var filtered = params.map(function(option) {
            var property = option.split(':')[0];
            var propertyValue = option.split(':')[1];
            var findRegex = new RegExp(propertyValue);
            return sorted.filter(function(object) {
                var value = object[property] ? object[property].toLowerCase() : null;
                return findRegex.test(value);
            });
        });

        var paged;
        if(page && page > 1) {
            paged = filtered.slice(10, 20);
        } else {
            paged = filtered.slice(0, 10);
        }
        paged = paged.reduce(function(a, b) { return a.concat(b); }).uniq();
        return {'count':paged.length,'next':null,'previous':null,'results': paged};
    };

    factory.prototype.searched = function(search, column, page) {
        var page1 = this.list_two().results;
        var page2 = this.list().results;
        var response = page1.concat(page2);
        //we do a normal order sort here to slice correctly below
        var sorted = response.sort(function(a,b) {
            return a[column] - b[column];
        });
        var regex = new RegExp(search);
        var searched = sorted.filter(function(object) {
            var value = object.name || object.username || object.request || object[column] || object;
            return regex.test(value);
        });
        var paged;
        if(page && page > 1) {
            paged = searched.slice(10, 20);
        } else {
            paged = searched.slice(0, 10);
        }
        return {'count':searched.length,'next':null,'previous':null,'results': paged};
    };

    factory.prototype.searched_related = function(related_id, column, page) {
        var page1 = this.list_two().results;
        var page2 = this.list().results;
        var response = page1.concat(page2);
        //we do a normal order sort here to slice correctly below
        var sorted = response.sort(function(a,b) {
            return a[column] - b[column];
        });
        var searched = sorted.filter(function(object) {
            return object[column] === related_id;
        });
        var paged;
        if(page && page > 1) {
            paged = searched.slice(10, 20);
        } else {
            paged = searched.slice(0, 10);
        }
        return {'count':searched.length,'next':null,'previous':null,'results': paged};
    };

    return factory;
}());

if (typeof window === 'undefined') {
    module.exports = BSRS_LIST_FIXTURE_MIXIN;
} else {
    define('bsrs-ember/vendor/mixin', ['exports'], function (exports) {
        'use strict';
        return BSRS_LIST_FIXTURE_MIXIN;
    });
}
