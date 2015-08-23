import Ember from 'ember';

var isEmpty = (data) => {
    return Object.keys(data).length === 0;
};

var previous = function() {
    return Ember.computed({
        set(key, value) {
            var data = this.get('_data') || {};
            if(!this.get('isDirty')) {
                var prev = this.get('_prevState') || {};
                if(!data[key] && value && isEmpty(data)) {
                    prev[key] = value; //first time
                }else if(data[key]) {
                    prev[key] = data[key]; //always set from prev value
                }
                this.set('_prevState', prev);
            }
            data[key] = value;
            return value;
        }
    }).property('_data');
};

export default previous;
