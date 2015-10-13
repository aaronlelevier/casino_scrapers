from django.db import models

from accounting.models import Currency
from category.models import Category
from utils.models import BaseNameModel, BaseModel, BaseManager
from utils import choices


class ThirdPartyStatusManager(BaseManager):

    def default(self):
        obj, created = self.get_or_create(description=choices.THIRD_PARTY_STATUS_CHOICES[0][0])
        return obj


class ThirdPartyStatus(BaseNameModel):
    description = models.CharField(max_length=100, choices=choices.THIRD_PARTY_STATUS_CHOICES,
        default=choices.THIRD_PARTY_STATUS_CHOICES[0][0])

    objects = ThirdPartyStatusManager()


class ThirdParty(BaseNameModel):
    '''
    TODO
    ----
    Put: Email, Address, PhoneNumber as a GenericKey on their own models, 
    so they can link up with ThirdParty, Person, Location.
    
    These are contractor companies, and other companies that the site Operators 
    will be dealing with.
    '''
    number = models.CharField(max_length=50, blank=True, null=True)
    status = models.ForeignKey(ThirdPartyStatus, blank=True, null=True)
    currency = models.ForeignKey(Currency, blank=True, null=True)
    categories = models.ManyToManyField(Category, related_name="categories", blank=True)