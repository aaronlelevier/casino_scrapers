import random
import uuid
from datetime import datetime
from django.utils import timezone

from work_order.models import (WorkOrderStatus, WorkOrderPriority, WorkOrder)
from person.models import Person
from location.models import Location
from work_order.models import WORKORDER_STATUSES
from utils.helpers import generate_uuid

TIME = timezone.now()

def create_work_orders(_many=1):
    return [create_work_order() for x in range(_many)]
    

def create_work_order():
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
    id = generate_uuid(WorkOrderStatus)
    if not name:
        name = random.choice(WORKORDER_STATUSES)
    try:
        obj = WorkOrderStatus.objects.get(name=name)
    except WorkOrderStatus.DoesNotExist:
        obj = WorkOrderStatus.objects.create(id=id, name=name)
    return obj


def create_work_order_statuses():
    return [create_work_order_status(s) for s in WORKORDER_STATUSES]
