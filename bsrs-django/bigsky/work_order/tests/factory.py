import random
from decimal import Decimal

from django.utils import timezone
from model_mommy import mommy

from accounting.tests.factory import create_currency
from category.models import Category
from person.models import Person
from provider.models import Provider
from provider.tests.factory import create_provider
from ticket.models import Ticket, TicketPriority, TicketStatus
from utils.create import _generate_chars
from utils.helpers import create_default, generate_uuid
from work_order.models import WorkOrder, WorkOrderPriority, WorkOrderStatus


TIME = timezone.now()

def create_work_orders(_many=1):
    return [create_work_order() for x in range(_many)]


def create_work_order():
    create_default(WorkOrderStatus)
    create_default(WorkOrderPriority)
    category = Category.objects.filter(children__isnull=True)[0]
    people = Person.objects.all()
    approver = random.choice(people)
    requester = _generate_chars()
    assignee = random.choice(people)

    ticket = Ticket.objects.filter(work_orders__isnull=True).first()
    if not ticket:
        ticket = mommy.make(Ticket, status=create_default(TicketStatus),
                            priority=create_default(TicketPriority))

    provider = Provider.objects.filter(categories__children__isnull=True).first()
    if not provider:
        provider = create_provider(category)

    kwargs = {
        'ticket': ticket,
        'approver': approver,
        'assignee': assignee,
        'category': category,
        'cost_estimate': Decimal(0),
        'cost_estimate_currency': create_currency(),
        'instructions': 'Need to describe the work for SC API',
        'location': approver.locations.first(),
        'status': WorkOrderStatus.objects.default(),
        'requester': requester,
        'priority': WorkOrderPriority.objects.default(),
        'provider': provider,
        'scheduled_date': TIME
    }

    id = generate_uuid(WorkOrder)

    wo = WorkOrder.objects.create(id=id, **kwargs)
    return wo


def create_work_order_status(name=None):
    if not name:
        name = random.choice(WorkOrderStatus.ALL)

    obj, _ = WorkOrderStatus.objects.get_or_create(name=name)
    return obj


def create_work_order_statuses():
    return [create_work_order_status(s) for s in WorkOrderStatus.ALL]


def create_work_order_priority(name=None):
    if not name:
        name = random.choice(WorkOrderPriority.ALL)

    obj, _ = WorkOrderPriority.objects.get_or_create(name=name)
    return obj


def create_work_order_priorities():
    return [create_work_order_priority(s) for s in WorkOrderPriority.ALL]
