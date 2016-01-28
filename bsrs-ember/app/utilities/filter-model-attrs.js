import Ember from 'ember';

var set_filter_model_attrs = function(filterModel, query) {
    let columns = query ? query.split(',') : [];
    columns.forEach((pair) => {
        const attrs = pair.split(':');
        if (attrs[0].indexOf('.') > -1) {
            const [object, field] = attrs[0].split('.');
            const obj = Ember.Object.create();
            obj[field] = attrs[1];
            //TODO: Andy this is the spot to fix the modal bug
            //if attrs[1] === "" AND filterModel ...
            //doesn't have that field (or it's also "") don't set anything :)
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
