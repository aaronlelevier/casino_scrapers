from model_mommy import mommy
import random
from utils.create import random_lorem

from ticket.models import Ticket, TicketStatus
from category.models import Category
from location.models import Location
from person.models import Person


def create_tickets(_many=1):
    '''
    Ticket Subjects 
    '''
    # categories = mommy.make(Category, _quantity=2)
    for i in range(_many):
        kwargs = {
           'subject' : random_lorem(),
           'request' : random_lorem(),
        }
        mommy.make(Ticket, make_m2m=True, **kwargs)
