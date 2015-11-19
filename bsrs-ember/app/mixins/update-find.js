import Ember from 'ember';

var UpdateFind = Ember.Mixin.create({
    update_find_query: function(column, value, find) {
        find = find || '';
        let newFind = '';
        let hash = column + ':' + value;
        let keysOnlyArray = find.split(',').map((criteria) => {
            return criteria.split(':')[0];
        });
        if(Ember.$.inArray(column, keysOnlyArray) === -1) {
            newFind = find && find.length > 0 ? find + ',' + hash : hash;
        } else {
            let regex = new RegExp(column +':\\w*,?');
            let replacedFind = find.replace(regex, hash + ',');
            newFind = replacedFind.replace(/,+$/, '');
        }
        return newFind;
    }
});

export default UpdateFind;
