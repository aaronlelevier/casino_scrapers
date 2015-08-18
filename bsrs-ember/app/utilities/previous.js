import Ember from 'ember';

var previous = function() {
    return Ember.computed({
        set(key, value) {
            var data = this.get('_data') || {};
            if(!this.get('isDirty')) {
                var prev = this.get('_prevState') || {};
                if(!data[key] && value) {
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
