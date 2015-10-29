from model_mommy import mommy

from category.models import Category
from category.tests.factory import create_categories
from person.tests.factory import create_person
from ticket.models import Ticket
from utils.create import random_lorem


def create_tickets(cc=None, requester=None, assignee=None, _many=1):
    cc = cc or create_person()
    assignee = assignee or create_person()
    requester = requester or create_person()

    create_categories()
    categories = Category.objects.all()
    categories = categories[:3]
    
    for i in range(_many):
        kwargs = {
           'subject': random_lorem(),
           'request': random_lorem(),
           'assignee': assignee,
           'requester': requester,
           'categories': categories,
        }
        ticket = mommy.make(Ticket, make_m2m=True, **kwargs)
        ticket.cc.add(cc)
