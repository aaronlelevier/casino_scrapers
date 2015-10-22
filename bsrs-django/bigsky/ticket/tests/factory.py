from model_mommy import mommy
import random
from utils.create import random_lorem

from ticket.models import Ticket, TicketStatus
from location.models import Location
from person.models import Person
from person.tests.factory import create_person
from category.models import Category
from category.tests.factory import create_categories


def create_tickets(assignee=None, _many=1):
    '''
    Ticket Subjects 
    '''

    if not assignee:
        assignee = create_person()

    create_categories()
    categories = Category.objects.all()
    categories = categories[:3]
    
    for i in range(_many):
        kwargs = {
           'subject' : random_lorem(),
           'request' : random_lorem(),
           'assignee' : assignee,
           'categories' : categories,
        }
        mommy.make(Ticket, make_m2m=True, **kwargs)
