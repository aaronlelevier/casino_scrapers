import Ember from 'ember';
import random from 'bsrs-ember/models/random';

export default Ember.Object.extend({
    v4: function() {
        return random.uuid();
    }
});
