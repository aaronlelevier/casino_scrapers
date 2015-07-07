import Ember from 'ember';
import Scott from 'bsrs-ember/admin/scott/model';

export default Ember.Route.extend({
	model: function(){
		return Scott.create();
	}
});
