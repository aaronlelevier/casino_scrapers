from model_mommy import mommy

from category.models import CategoryType


def create_category_types():
    issue = mommy.make(CategoryType, name='issue')
    trade = mommy.make(CategoryType, name='trade', child=issue)
    type = mommy.make(CategoryType, name='type', child=trade)