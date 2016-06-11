import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export let columns = [
  {
    field: 'priority.translated_name',
    headerLabel: 'ticket.label.priority-name',
    headerIsTranslatable: true,
    isFilterable: true,
    isSearchable: true,
    templateName: 'tickets/ticket-priority-tag',
    classNames: ['ticket-priority'],
  },
  {
    field: 'status.translated_name',
    headerLabel: 'ticket.label.status-name',
    headerIsTranslatable: true,
    isFilterable: true,
    isSearchable: true,
    templateName: 'tickets/ticket-status-tag',
    classNames: ['ticket-status'],
  },
  {
    field: 'number',
    headerLabel: 'ticket.label.numberSymbol',
    headerIsTranslatable: true,
    isSortable: true,
    isSearchable: true,
    classNames: ['ticket-number'],
  },
  {
    field: 'created',
    headerLabel: 'ticket.label.created',
    headerIsTranslatable: true,
    isSortable: true,
    templateName: 'grid/helpers/grid-date',
    classNames: ['ticket-created'],
  },
  {
    field: 'location.name',
    headerLabel: 'ticket.label.location-name',
    headerIsTranslatable: true,
    isSortable: true,
    isFilterable: true,
    isSearchable: true,
    classNames: ['ticket-location'],
  },
  {
    field: 'assignee.fullname',
    headerLabel: 'ticket.label.assignee-fullname',
    headerIsTranslatable: true,
    isSortable: true,
    isFilterable: true,
    isSearchable: true,
    classNames: ['ticket-assignee'],
  },
  {
    field: 'categories',
    headerLabel: 'ticket.label.category-name',
    headerIsTranslatable: true,
    classNames: ['ticket-category'],
  },
  {
    field: 'request',
    headerLabel: 'ticket.label.request',
    headerIsTranslatable: true,
    isSortable: true,
    isFilterable: true,
    isSearchable: true,
    classNames: ['ticket-request'],
  }
];

export default GridViewComponent.extend({
  layoutName: 'components/grid-view',
  columns: columns
});
