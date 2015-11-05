import random

from model_mommy import mommy

from category.models import Category, CATEGORY_STATUSES,CategoryStatus
from utils.create import random_lorem


def create_categories(_many=0):
    create_category_statuses()
    # Repair
    type = mommy.make(Category, name='repair',
        subcategory_label='trade', status=random.choice(CategoryStatus.objects.all()))
     
    
    num_of_cat = random.randrange(2,5)
    if _many > 0:
        num_of_cat = _many

    for i in range(0, num_of_cat):
        name = random_lorem(1)
        status = random.choice(CategoryStatus.objects.all())
        trade = mommy.make(Category, name=name,
            subcategory_label='issue', parent=type, status=status)

    type.children.add(trade)
    type.save()

    for category in Category.objects.filter(subcategory_label='issue'):
        for i in range(random.randrange(2, 7)):
            name = random_lorem(2)
            status = random.choice(CategoryStatus.objects.all())
            mommy.make(Category, name=name,
                subcategory_label='sub_issue', parent=category, status=status)


def create_category_statuses():
    for status in CATEGORY_STATUSES:
        CategoryStatus.objects.get_or_create(name=status)


def create_category_status(name=None):
    if not name:
        name = random.choice(CATEGORY_STATUSES)

    obj, _ = CategoryStatus.objects.get_or_create(name=name)

    return obj
