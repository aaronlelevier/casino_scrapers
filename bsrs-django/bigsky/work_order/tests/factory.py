import random
from django.utils import timezone

from work_order.models import WorkOrderStatus, WorkOrderPriority, WorkOrder
from person.models import Person
from work_order.models import WORKORDER_STATUSES
from utils.helpers import generate_uuid
from utils.tests.test_helpers import create_default


TIME = timezone.now()

def create_work_orders(_many=1):
    return [create_work_order() for x in range(_many)]
    

def create_work_order():
    create_default(WorkOrderStatus)
    create_default(WorkOrderPriority)
    people = Person.objects.all()
    requester = random.choice(people)
    assignee = random.choice(people)

    kwargs = {
        'location': requester.locations.first(),
        'status': WorkOrderStatus.objects.default(),
        'priority': WorkOrderPriority.objects.default(),
        'requester': requester,
        'assignee': assignee,
        'date_due': TIME
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
