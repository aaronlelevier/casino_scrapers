import Ember from 'ember';
import GridViewComponent from 'bsrs-ember/components/grid-view/component';

export default GridViewComponent.extend({
  layoutName: 'components/grid-view',
  columns: [
    {
      field: 'status.name',
      headerLabel: 'admin.location.label.status-name',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true,
      templateName: 'tickets/ticket-status-tag',
      classNames: ['location-status'],
      width: '150px',
    },
    {
      field: 'name',
      headerLabel: 'admin.location.label.name',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true
    },
    {
      field: 'number',
      headerLabel: 'admin.location.label.number',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true
    },
    {
      field: 'location_level.name',
      headerLabel: 'admin.location.label.location_level',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true
    }
  ]
});
