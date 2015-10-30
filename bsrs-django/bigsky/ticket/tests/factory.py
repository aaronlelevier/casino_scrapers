import uuid
import random

from django.conf import settings

from model_mommy import mommy

from category.models import Category
from category.tests.factory import create_categories
from location.models import Location
from location.tests.factory import create_locations
from person.tests.factory import create_single_person
from ticket.models import (Ticket, TicketStatus, TicketPriority, TicketCategory,
    TicketActivity)
from utils.create import random_lorem, _generate_chars


def create_ticket():
    create_locations()
    create_categories()

    ticket = Ticket.objects.create(
        location = random.choice(Location.objects.all()),
        status = mommy.make(TicketStatus),
        priority = mommy.make(TicketPriority),
        assignee = create_single_person(),
        requester = create_single_person(),
        request = _generate_chars()
    )
    ticket.cc.add(create_single_person())
    ticket.categories.add(Category.objects.first())
    return ticket


def create_tickets(_many=1):
    return [create_ticket() for x in range(_many)]


def create_ticket_category(name=_generate_chars(),
                           weight=random.randrange(1, settings.ACTIVITY_DEFAULT_WEIGHT + 1)):

    return mommy.make(TicketCategory, name=name, weight=weight)
