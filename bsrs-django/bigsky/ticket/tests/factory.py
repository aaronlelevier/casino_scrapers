from model_mommy import mommy

from ticket.models import Ticket

def create_tickets():
    '''
    Ticket Contactors with unique ``subject``
    '''
    ticket = mommy.make(Ticket, subject="Plumbing Fix")
    ticket = mommy.make(Ticket, subject="Broken Glass")
    ticket = mommy.make(Ticket, subject="Roof Repair")
