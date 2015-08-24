from model_mommy import mommy

from category.models import Category


def create_categories():
    type = mommy.make(Category, name='repair', subcategory_label='trade')
    trade = mommy.make(Category, name='electric', subcategory_label='issue', parent=type)
    issue = mommy.make(Category, name='outlets', subcategory_label='sub_issue', parent=trade)
    issue2 = mommy.make(Category, name='fans', subcategory_label='sub_issue', parent=trade)
