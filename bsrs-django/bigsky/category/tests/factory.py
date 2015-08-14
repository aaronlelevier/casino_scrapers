from model_mommy import mommy

from category.models import CategoryType


def create_category_types():
    type = mommy.make(CategoryType, name='type')
    trade = mommy.make(CategoryType, name='trade', parent=type)
    issue = mommy.make(CategoryType, name='issue', parent=trade)