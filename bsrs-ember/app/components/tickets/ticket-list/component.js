import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view',
    columns: [
        {field: 'priority.translated_name', headerLabel: 'Priority', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'status.translated_name', headerLabel: 'Status', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'created', formattedField: 'formatted_date', headerLabel: 'Created', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'location.name', headerLabel: 'Location', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'assignee.fullname', headerLabel: 'Assignee', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'category_names', headerLabel: 'Categories'},
        {field: 'request', headerLabel: 'Request', isSortable: true, isFilterable: true, isSearchable: true},
        {field: 'number', headerLabel: 'Ticket Number'}
    ]
});
