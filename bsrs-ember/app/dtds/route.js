import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

const detail_msg = 'admin.dtd.empty-detail';

var DTDSRoute = GridViewRoute.extend({
    init(){
        this.get('store').push('dtd-header', {id: 1, showingList:true, showingDetail:true, showingPreview:true, message: detail_msg});
        return this._super();
    },
    repository: inject('dtd'),
});

export default DTDSRoute;
