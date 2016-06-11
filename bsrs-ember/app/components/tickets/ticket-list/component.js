import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
  layoutName: 'components/grid-view',
  columns: [
    {
      field: 'priority.translated_name',
      headerLabel: 'ticket.label.priority-name',
      headerIsTranslatable: true,
      isFilterable: true,
      isSearchable: true,
      templateName: 'tickets/ticket-priority-tag',
      classNames: ['ticket-priority'],
      mobileOrder: 40
    },
    {
      field: 'status.translated_name',
      headerLabel: 'ticket.label.status-name',
      headerIsTranslatable: true,
      isFilterable: true,
      isSearchable: true,
      templateName: 'tickets/ticket-status-tag',
      classNames: ['ticket-status'],
      mobileOrder: 30
    },
    {
      field: 'number',
      headerLabel: 'ticket.label.numberSymbol',
      headerIsTranslatable: true,
      isSortable: true,
      isSearchable: true,
      classNames: ['ticket-number'],
      mobileOrder: 80
    },
    {
      field: 'created',
      headerLabel: 'ticket.label.created',
      headerIsTranslatable: true,
      isSortable: true,
      templateName: 'grid/helpers/grid-date',
      classNames: ['ticket-created'],
      mobileOrder: 70
    },
    {
      field: 'location.name',
      headerLabel: 'ticket.label.location-name',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true,
      classNames: ['ticket-location'],
      mobileOrder: 50
    },
    {
      field: 'assignee.fullname',
      headerLabel: 'ticket.label.assignee-fullname',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true,
      classNames: ['ticket-assignee'],
      mobileOrder: 60
    },
    {
      field: 'categories',
      headerLabel: 'ticket.label.category-name',
      headerIsTranslatable: true,
      classNames: ['ticket-category'],
      mobileOrder: 10
    },
    {
      field: 'request',
      headerLabel: 'ticket.label.request',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true,
      classNames: ['ticket-request'],
      mobileOrder: 20
    }
  ]
});
