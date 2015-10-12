from model_mommy import mommy
import random
from utils import create

from ticket.models import Ticket, TicketStatus


def create_ticket(subject, request):
    ticket = mommy.make(Ticket, subject=subject, request=request)


def create_tickets(_many=1):
    '''
    Ticket Subjects 
    '''
    for i in range(_many):
        subject = random.choice(create.LOREM_IPSUM_WORDS.split())
        request = random.choice(create.LOREM_IPSUM_WORDS.split())
        create_ticket(subject, request)