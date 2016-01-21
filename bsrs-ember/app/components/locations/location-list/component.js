import Ember from 'ember';
import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view',
    version: 'vNext', //TODO: remove this after the grid-view upgrade is complete
    columns: [
        {field: 'name', headerLabel: 'Name', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'number', headerLabel: 'Number', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'status.translated_name', headerLabel: 'Status', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'location_level', headerLabel: 'Organization'}
    ]
});
