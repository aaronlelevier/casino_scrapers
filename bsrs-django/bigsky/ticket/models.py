from django.db import models

from utils.models import BaseNameModel, BaseModel, BaseManager
from utils import choices


class TicketStatusManager(BaseManager):

    def default(self):
        obj, created = self.get_or_create(name=choices.TICKET_STATUS_CHOICES[0][0])
        return obj


class TicketStatus(BaseNameModel):
    # name = models.CharField(max_length=100, choices=choices.TICKET_STATUS_CHOICES,
    #     default=choices.TICKET_STATUS_CHOICES[0][0])

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
    subject = models.TextField(max_length=100, blank=True, null=True)
    number = models.CharField(max_length=50, blank=True, null=True)
    status = models.ForeignKey(TicketStatus, blank=True, null=True)
    priority = models.ForeignKey(TicketPriority, blank=True, null=True)
