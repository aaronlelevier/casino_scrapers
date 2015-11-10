import random

from model_mommy import mommy

from category.models import Category, CATEGORY_STATUSES, CategoryStatus
from utils.create import random_lorem


def create_categories(_many=None):
    create_category_statuses()
    # Repair
    type = mommy.make(Category, name='repair',
        subcategory_label='trade', status=random.choice(CategoryStatus.objects.all()))
    
    if _many:
        num_of_cat = _many
    else:
        num_of_cat = random.randrange(2,5)

    for i in range(0, num_of_cat):
        name = random_lorem(1)
        status = random.choice(CategoryStatus.objects.all())
        issue = mommy.make(Category, name=name,
            subcategory_label='issue', parent=type, status=status)

    type.children.add(issue)

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
