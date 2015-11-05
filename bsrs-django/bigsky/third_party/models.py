from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericRelation

from accounting.models import Currency
from category.models import Category
from contact.models import PhoneNumber, Address, Email
from utils.models import BaseNameModel, BaseManager


class ThirdPartyStatusManager(BaseManager):

    def default(self):
        obj, created = self.get_or_create(name=settings.THIRD_PARTY_STATUS_DEFAULT)
        return obj


class ThirdPartyStatus(BaseNameModel):
    description = models.CharField(max_length=100, blank=True)

    objects = ThirdPartyStatusManager()


class ThirdParty(BaseNameModel):
    '''
    These are contractor companies, and other companies that the site Operators 
    will be dealing with.
    '''
    number = models.CharField(max_length=50, unique=True, blank=True, null=True)
    status = models.ForeignKey(ThirdPartyStatus, blank=True, null=True)
    currency = models.ForeignKey(Currency, blank=True, null=True)
    categories = models.ManyToManyField(Category, related_name="third_parties", blank=True)
    phone_numbers = GenericRelation(PhoneNumber)
    addresses = GenericRelation(Address)
    emails = GenericRelation(Email)

    def save(self, *args, **kwargs):
        self._update_defaults()
        return super(ThirdParty, self).save(*args, **kwargs)

    def _update_defaults(self):
        if not self.status:
            self.status = ThirdPartyStatus.objects.default()
        if not self.currency:
            self.currency = Currency.objects.default()
