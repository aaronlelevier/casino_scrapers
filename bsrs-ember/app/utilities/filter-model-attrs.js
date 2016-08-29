import Ember from 'ember';

/*
 * rehydrate filterModel object in route which is used in the input-dynamic-filter
*/
var set_filter_model_attrs = function(filterModel, query) {
    let columns = query ? query.split(',') : [];
    columns.forEach((pair) => {
        const attrs = pair.split(':');
        if(attrs[1] === ''){
            const key = attrs[0].indexOf('.') > -1 ? attrs[0].split('.')[0] : attrs[0];
            filterModel.set(key, undefined);
        }else if (attrs[0].indexOf('.') > -1) {
            const [object, field] = attrs[0].split('.');
            const obj = Ember.Object.create();
            obj[field] = attrs[1];
            filterModel.set(object, obj);
        }else{
            filterModel.set(attrs[0], attrs[1]);
        }
    });
    if(typeof query === 'undefined') {
        var props = {};
        Object.keys(filterModel).forEach(function(key) {
            props[key] = undefined;
        });
        filterModel.setProperties(props);
    }
};

export default set_filter_model_attrs;
