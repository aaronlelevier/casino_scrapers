import random
import uuid

from work_order.models import (WorkOrderStatus, WorkOrderPriority, WorkOrder)
from person.models import Person
from location.models import Location
from utils.helpers import generate_uuid


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
        'assignee': assignee
    }

    incr = WorkOrder.objects.count()
    id = generate_uuid(WORK_ORDER_BASE_ID, incr+1)

    wo = WorkOrder.objects.create(id=id, **kwargs)
    return wo
