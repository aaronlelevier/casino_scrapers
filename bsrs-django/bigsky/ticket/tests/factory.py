import uuid
from random import randrange

from django.conf import settings

from model_mommy import mommy

from category.models import Category
from category.tests.factory import create_categories
from person.tests.factory import create_single_person
from ticket.models import Ticket, TicketCategory, TicketActivity
from utils.create import random_lorem, _generate_chars


def create_tickets(cc=create_single_person(),
                   requester=create_single_person(),
                   assignee=create_single_person(),
                   _many=1):

    create_categories()
    categories = Category.objects.all()
    categories = categories[:3]

    tickets = []
    for i in range(_many):
        kwargs = {
            'requester': requester,
            'cc': [cc],
            'request': random_lorem(),
            'assignee': assignee,
            'categories': categories,
        }
        tickets.append(mommy.make(Ticket, **kwargs))

    return tickets


def create_ticket_category(name=_generate_chars(),
                           weight=randrange(1, settings.ACTIVITY_DEFAULT_WEIGHT + 1)):

    return mommy.make(TicketCategory, name=name, weight=weight)
