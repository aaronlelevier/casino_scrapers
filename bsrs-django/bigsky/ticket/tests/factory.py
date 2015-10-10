from model_mommy import mommy

from ticket.models import Ticket, TicketStatus

def create_tickets():
    '''
    Ticket Subjects 
    '''
    ticket = mommy.make(Ticket, subject="Plumbing Fix")
    ticket = mommy.make(Ticket, subject="Broken Glass")
    ticket = mommy.make(Ticket, subject="Roof Repair")

