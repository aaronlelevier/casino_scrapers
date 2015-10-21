from model_mommy import mommy
import random
from utils.create import random_lorem

from ticket.models import Ticket, TicketStatus
from category.models import Category
from location.models import Location
from person.models import Person
from person.tests.factory import create_person


def create_tickets(assignee=None, _many=1):
    '''
    Ticket Subjects 
    '''
    # categories = mommy.make(Category, _quantity=2)
    if not assignee:
        assignee = create_person()

    for i in range(_many):
        kwargs = {
           'subject' : random_lorem(),
           'request' : random_lorem(),
           'assignee' : assignee,
        }
        mommy.make(Ticket, make_m2m=True, **kwargs)
