import Ember from 'ember';
import GridViewComponent from 'bsrs-ember/components/grid-view/component';
const { inject } = Ember;

export default GridViewComponent.extend({
  personCurrent: inject.service(),
  columns: [
    {
      field: 'key',
      headerLabel: 'admin.dtd.label.key',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true,
      classNames: ['dtd-key']
    },
    {
      field: 'description',
      headerLabel: 'admin.dtd.label.description',
      headerIsTranslatable: true,
      isSortable: true,
      isFilterable: true,
      isSearchable: true,
      classNames: ['dtd-description']
    }
  ]
});

