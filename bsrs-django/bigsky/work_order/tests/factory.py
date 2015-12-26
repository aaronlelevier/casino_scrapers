import random
import uuid
from datetime import datetime

from work_order.models import (WorkOrderStatus, WorkOrderPriority, WorkOrder)
from person.models import Person
from location.models import Location
from work_order.models import WORKORDER_STATUSES
from utils.helpers import generate_uuid

TIME =  datetime(2015, 2, 1, 14, 30, 00)

def create_work_orders(_many=1):
    return [create_work_order() for x in range(_many)]
    
WORK_ORDER_BASE_ID = "51f530c4-ce6c-4724-9cfd-37a16e343"

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

    incr = WorkOrder.objects.count()
    id = generate_uuid(WORK_ORDER_BASE_ID, incr+1)

    wo = WorkOrder.objects.create(id=id, **kwargs)
    return wo


WORKORDER_STATUS_BASE_ID = "aed0c752-beff-4f0f-9e86-55bfc9914"

def create_work_order_status(name=None):
    incr = WorkOrderStatus.objects.count()
    id = generate_uuid(WORKORDER_STATUS_BASE_ID, incr+1)
    if not name:
        name = random.choice(WORKORDER_STATUSES)
    try:
        obj = WorkOrderStatus.objects.get(name=name)
    except WorkOrderStatus.DoesNotExist:
        obj = WorkOrderStatus.objects.create(id=id, name=name)
    return obj


def create_work_order_statuses():
    return [create_work_order_status(s) for s in WORKORDER_STATUSES]
