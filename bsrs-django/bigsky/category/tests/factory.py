import random

from model_mommy import mommy

from category.models import Category, CATEGORY_STATUSES, CategoryStatus
from utils.create import random_lorem
from utils.helpers import generate_uuid



CATEGORY_BASE_ID = "24f530c4-ce6c-4724-9cfd-37a16e787"


def create_categories(_many=None):
    statuses = create_category_statuses()

    # Type
    incr = Category.objects.count()

    type = Category.objects.create(
        id=generate_uuid(CATEGORY_BASE_ID, incr+1),
        name='repair',
        subcategory_label='trade',
        status=random.choice(statuses)
    )

    # Trade
    trade_names = ['plumbing', 'electrical']
    incr = Category.objects.count()

    for i, name in enumerate(trade_names):
        status = random.choice(statuses)
        trade = Category.objects.create(
            id=generate_uuid(CATEGORY_BASE_ID, incr+i+1),
            name=name,
            subcategory_label='issue',
            parent=type,
            status=status
        )

    # type.children.add(issue)

    # Issue
    for category in Category.objects.filter(subcategory_label='issue'):
        for i in range(random.randrange(2, 7)):
            name = random_lorem(2)
            status = random.choice(statuses)
            incr = Category.objects.count()
            Category.objects.create(
                id=generate_uuid(CATEGORY_BASE_ID, incr+1),
                name=name,
                subcategory_label='sub_issue',
                parent=category,
                status=status
            )


CATEGORY_STATUS_BASE_ID = "20f530c4-ce6c-4724-9cfd-37a16e787"


def create_category_statuses():
    statuses = []

    for i, status in enumerate(CATEGORY_STATUSES):
        id = generate_uuid(CATEGORY_STATUS_BASE_ID, incr=i)
        
        try:
            cs = CategoryStatus.objects.get(name=status)
        except CategoryStatus.DoesNotExist:
            cs = CategoryStatus.objects.create(id=id, name=status)
        finally:
            statuses.append(cs)

    return statuses



def create_category_status(name=None):
    create_category_statuses()

    if name and name not in CATEGORY_STATUSES:
        raise Exception("{} not in CategoryStatus list.".format(name))

    if name:
        status = CategoryStatus.objects.get(name=name)
    else:
        name = random.choice(CATEGORY_STATUSES)
        status = CategoryStatus.objects.get(name=name)

    return status
