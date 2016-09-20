import BaseValidator from 'ember-cp-validations/validators/base';

const TicketCategories = BaseValidator.extend({
  /* @method validate - ticket-categories
   * @param {string} attribute - categories field on ticket model
   * want to prevent user from saving a ticket if the leaf category still has more children to select from
   * tree may be null so need to check
  */
  validate(value, options, model/*, attribute*/) {
    let categories = model.get('categories') || [];
    if(categories.get('length') < 1) {
      return 'errors.ticket.categories';
    }
    let parent = model.get('top_level_category');
    let tree = model.construct_category_tree(parent);
    const valid = (tree && tree.pop().get('children').get('length') === 0) ? true : 'errors.ticket.categories';
    return valid;
  }
});

TicketCategories.reopenClass({
  /**
   * @param {String}  attribute   The attribute being evaluated
   * @param {Unknown} options     Options passed into your validator
   * @return {Array}
   */
  getDependentsFor(attribute/*, options */) {
    return `model.${attribute}.[]`;
  }
});

export default TicketCategories;
