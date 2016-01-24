import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
    layoutName: 'components/grid-view',
    columns: [
        {
            field: 'priority.translated_name',
            headerLabel: 'ticket.label.priority-name',
            headerIsTranslatable: true,
            isSortable: true,
            isFilterable: true,
            isSearchable: true,
            templateName: 'tickets/ticket-priority-tag',
            classNames: ['ticket-priority']
        },
        {
            field: 'status.translated_name',
            headerLabel: 'ticket.label.status-name',
            headerIsTranslatable: true,
            isSortable: true,
            isFilterable: true,
            isSearchable: true,
            templateName: 'tickets/ticket-status-tag',
            classNames: ['ticket-status']
        },
        {
            field: 'created',
            formattedField: 'formatted_date',
            headerLabel: 'ticket.label.created',
            headerIsTranslatable: true,
            isSortable: true
        },
        {
            field: 'location.name',
            headerLabel: 'ticket.label.location-name',
            headerIsTranslatable: true,
            isSortable: true,
            isFilterable: true,
            isSearchable: true
        },
        {
            field: 'assignee.fullname',
            headerLabel: 'ticket.label.assignee-fullname',
            headerIsTranslatable: true,
            isSortable: true,
            isFilterable: true,
            isSearchable: true
        },
        {
            field: 'category_names',
            headerLabel: 'ticket.label.category-name',
            headerIsTranslatable: true
        },
        {
            field: 'request',
            headerLabel: 'ticket.label.request',
            headerIsTranslatable: true,
            isSortable: true,
            isFilterable: true,
            isSearchable: true
        },
        {
            field: 'number',
            headerLabel: 'ticket.label.numberSymbol',
            headerIsTranslatable: true,
            isSortable: true,
            // isSearchable: true
        }
    ]
});
