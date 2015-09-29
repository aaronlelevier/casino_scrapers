var BSRS_CATEGORY_FACTORY = (function() {
    var factory = function(category_defaults) {
        this.category_defaults = category_defaults
    };
    factory.prototype.generate = function(i) {
        return {
            id: i,
            name: this.category_defaults.nameOne,
            description: this.category_defaults.descriptionRepair,
            cost_amount: this.category_defaults.costAmountOne,
            cost_currency: this.category_defaults.currency,
            cost_code: this.category_defaults.costCodeOne,
            label: this.category_defaults.labelOne,
            subcategory_label: this.category_defaults.subCatLabelOne,
            parent: []
        }
    },
    factory.prototype.children = function() {
        return [{id: this.category_defaults.idChild, name: this.category_defaults.nameTwo, description: this.category_defaults.descriptionMaintenance}];
    },
    factory.prototype.list = function() {
        var response = [];
        for (var i=1; i <= 10; i++) {
            var uuid = 'ec62006b-6275-4aa9-abfa-38b146383d3';
            if (i < 10) {
                uuid = uuid + '0' + i;
            } else{
                uuid = uuid + i;
            }
            var category = this.generate(uuid);
            category.name += i;
            category.label += i;
            response.push(category);
        }
        //we do a reverse order sort here to verify a real sort occurs in the component
        var sorted = response.sort(function(a,b) {
            return b.id - a.id;
        });
        return {'count':19,'next':null,'previous':null,'results': sorted};
    },
    factory.prototype.list_two = function() {
        var response = [];
        for (var i=11; i <= 19; i++) {
            var uuid = 'ec62006b-6275-4aa9-abfa-38b146383d3';
            var category = this.generate(uuid + i);
            category.name = 'cococat' + i;
            category.label = 'scohat' + i;
            response.push(category);
        }
        return {'count':19,'next':null,'previous':null,'results': response};
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
    factory.prototype.sorted = function(column, page) {
        var response;
        if(page && page === 2) {
            response = this.list_two().results;
        } else {
            response = this.list().results;
        }
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
        return {'count':19,'next':null,'previous':null,'results': sorted};
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
        return {'count':filtered.length,'next':null,'previous':null,'results': paged};
    },
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
            var value = object.name;
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

    factory.prototype.detail = function(i) {
        var category = this.generate(i);
        category.sub_category_label = this.category_defaults.subCatLabelOne;
        category.parent = this.category_defaults.parent;
        category.children = this.children();
        return category;
    },
    factory.prototype.empty = function() {
        return {'count':0,'next':null,'previous':null,'results': []};
    };
    factory.prototype.put = function(category) {
        var response = this.generate(category.id)
        response.children = this.children();
        response.children = response.children.map(function(child) {
            return child.id ;
        });
        for (var key in category) {
            response[key] = category[key];
        }
        return response;
    };
    return factory;
})();

if (typeof window === 'undefined') {
    var category_defaults = require('./defaults/category');
    module.exports = new BSRS_CATEGORY_FACTORY(category_defaults);
} else {
    define('bsrs-ember/vendor/category_fixtures', ['exports', 'bsrs-ember/vendor/defaults/category'], function (exports, category_defaults) {
        'use strict';
        return new BSRS_CATEGORY_FACTORY(category_defaults);
    });
}

