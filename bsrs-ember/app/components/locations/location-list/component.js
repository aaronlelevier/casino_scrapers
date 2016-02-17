import Ember from 'ember';
import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view',
    columns: [
        {
            field: 'name',
            headerLabel: 'Name',
            isSortable: true,
            isFilterable: true,
            isSearchable: true
        },
        {
            field: 'number',
            headerLabel: 'Number',
            isSortable: true,
            isFilterable: true,
            isSearchable: true
        },
        {
            field: 'status.translated_name',
            headerLabel: 'Status',
            isSortable: true,
            isFilterable: true,
            isSearchable: true,
            templateName: 'tickets/ticket-status-tag',
            classNames: ['location-status']
        },
        {
            field: 'location_level.name',
            headerLabel: 'Organization',
            isSortable: true,
            isFilterable: true,
            isSearchable: true
        }
    ]
});
