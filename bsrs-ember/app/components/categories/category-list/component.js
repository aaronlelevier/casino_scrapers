import Ember from 'ember';
import GridViewComponent from 'bsrs-ember/components/grid-view-2/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view-2',
    searchable: ['name', 'description', 'label'],
    nonsearchable: ['cost_amount', 'cost_code']
});
