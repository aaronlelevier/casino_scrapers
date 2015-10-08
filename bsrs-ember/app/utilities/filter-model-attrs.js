var set_filter_model_attrs = function(filterModel, query) {
    let columns = query ? query.split(',') : [];
    columns.forEach((pair) => {
        let attrs = pair.split(':');
        filterModel.set(attrs[0], attrs[1]);
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
