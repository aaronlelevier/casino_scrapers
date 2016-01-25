import Ember from 'ember';
import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view',
    columns: [
        {field: 'name', headerLabel: 'Name', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'description', headerLabel: 'Description', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'label', headerLabel: 'Label', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'cost_amount', headerLabel: 'Cost Amount'},
        {field: 'cost_code', headerLabel: 'Cost Code'}
    ]
});
