from django.db import models

from utils.models import BaseNameModel, BaseModel, BaseManager
from utils import choices
from person.models import Person
from category.models import Category
from location.models import Location


class TicketStatusManager(BaseManager):

    def default(self):
        obj, created = self.get_or_create(name=choices.TICKET_STATUS_CHOICES[0][0])
        return obj


class TicketStatus(BaseModel):
    name = models.CharField(max_length=50, default=choices.TICKET_STATUS_CHOICES[0][0])

    objects = TicketStatusManager()

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name
        }

        
class TicketPriorityManager(BaseManager):

    def default(self):
        obj, created = self.get_or_create(name=choices.TICKET_PRIORITY_CHOICES[0][0])
        return obj
    

class TicketPriority(BaseModel):
    name = models.CharField(max_length=50, default=choices.TICKET_STATUS_CHOICES[0][0])

    objects = TicketPriorityManager()

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name
        }

        
class Ticket(BaseModel):
    '''
    Ticket model with auto incrementing number field
    '''
    def no_ticket_models():
        no = Ticket.objects.count()
        if no == None:
            return 1
        else: 
            return no + 1

    status = models.ForeignKey(TicketStatus)
    priority = models.ForeignKey(TicketPriority)
    subject = models.TextField(max_length=100, null=True)
    number = models.IntegerField(default=no_ticket_models)
    cc = models.ManyToManyField(Person, blank=True)
    assignee = models.ForeignKey(Person, blank=True, null=True, related_name="person_ticket_assignee")
    request = models.TextField(max_length=100, null=True)
    categories = models.ManyToManyField(Category, blank=True)
    location = models.ForeignKey(Location)
    requester = models.ForeignKey(Person, blank=True, null=True, related_name="person_ticket_requester")
