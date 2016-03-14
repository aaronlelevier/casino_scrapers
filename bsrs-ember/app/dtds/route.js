import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var DTDSRoute = GridViewRoute.extend({
    init(){
        const store = this.get('store');
        store.push('dtd-header', {id: 1, showingList:true, showingDetail:true, showingPreview:true});
        return this._super();
    },
    repository: inject('dtd'),
});

export default DTDSRoute;
