from django.db import models

from utils.models import BaseNameModel, BaseModel, BaseManager
from utils import choices
from person.models import Person


class TicketStatusManager(BaseManager):

    def default(self):
        obj, created = self.get_or_create(name=choices.TICKET_STATUS_CHOICES[0][0])
        return obj


class TicketStatus(BaseModel):
    name = models.CharField(max_length=50, default=choices.TICKET_STATUS_CHOICES[0][0])

    objects = TicketStatusManager()


class TicketPriorityManager(BaseManager):

    def default(self):
        obj, created = self.get_or_create(name=choices.TICKET_PRIORITY_CHOICES[0][0])
        return obj
    

class TicketPriority(BaseNameModel):
    # description = models.CharField(max_length=100, choices=choices.TICKET_PRIORITY_CHOICES,
    #     default=choices.TICKET_PRIORITY_CHOICES[0][0])

    objects = TicketPriorityManager()


class Ticket(BaseModel):
    '''
    Ticket model
    '''
    def no_ticket_models():
        no = Ticket.objects.count()
        if no == None:
            return 1
        else: 
            return no + 1
    status = models.ForeignKey(TicketStatus, null=True)
    priority = models.ForeignKey(TicketPriority, null=True)
    subject = models.TextField(max_length=100, blank=True, null=True)
    number = models.IntegerField(default=no_ticket_models)
    cc = models.ManyToManyField(Person, blank=True)
    assignee = models.ForeignKey(Person, blank=True, null=True, related_name="person_ticket_assignee")
    request = models.TextField(max_length=100, blank=True, null=True)
