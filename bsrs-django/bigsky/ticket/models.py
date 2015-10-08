from django.db import models

from utils.models import BaseModel
# from utils import choices


# class TicketStatusManager(BaseManager):

#     def default(self):
#         obj, created = self.get_or_create(description=choices.THIRD_PARTY_STATUS_CHOICES[0][0])
#         return obj


# class TicketStatus(BaseNameModel):
#     description = models.CharField(max_length=100, choices=choices.THIRD_PARTY_STATUS_CHOICES,
#         default=choices.THIRD_PARTY_STATUS_CHOICES[0][0])

#     objects = TicketStatusManager()


class Ticket(BaseModel):
    '''
    Ticket model
    '''
    subject = models.TextField(max_length=100, blank=True, null=True)
    # number = models.CharField(max_length=50, blank=True, null=True)
    # status = models.ForeignKey(TicketStatus, blank=True, null=True)
