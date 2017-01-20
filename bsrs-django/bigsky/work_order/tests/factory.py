import random
from decimal import Decimal
from django.utils import timezone

from category.models import Category
from person.models import Person
from work_order.models import WorkOrderStatus, WorkOrderPriority, WorkOrder
from work_order.models import WORKORDER_STATUSES

from accounting.tests.factory import create_currency
from provider.tests.factory import create_provider
from utils.helpers import generate_uuid
from utils.tests.test_helpers import create_default


TIME = timezone.now()

def create_work_orders(_many=1):
    return [create_work_order() for x in range(_many)]


def create_work_order():
    create_default(WorkOrderStatus)
    create_default(WorkOrderPriority)
    category = Category.objects.filter(children__isnull=True)[0]
    people = Person.objects.all()
    requester = random.choice(people)
    assignee = random.choice(people)

    kwargs = {
        'assignee': assignee,
        'category': category,
        'cost_estimate': Decimal(0),
        'cost_estimate_currency': create_currency(),
        'instructions': 'Need to describe the work for SC API',
        'location': requester.locations.first(),
        'status': WorkOrderStatus.objects.default(),
        'requester': requester,
        'priority': WorkOrderPriority.objects.default(),
        'provider': create_provider(category),
        'scheduled_date': TIME
    }

    id = generate_uuid(WorkOrder)

    wo = WorkOrder.objects.create(id=id, **kwargs)
    return wo


def create_work_order_status(name=None):
    if not name:
        name = random.choice(WORKORDER_STATUSES)

    obj, _ = WorkOrderStatus.objects.get_or_create(name=name)
    return obj


def create_work_order_statuses():
    return [create_work_order_status(s) for s in WORKORDER_STATUSES]
