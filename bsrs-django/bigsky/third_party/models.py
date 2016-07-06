from django.db import models
from django.contrib.contenttypes.fields import GenericRelation

from accounting.models import Currency
from category.models import Category
from contact.models import PhoneNumber, Address, Email
from third_party.config import THIRD_PARTY_STATUSES
from utils.models import BaseNameModel, DefaultNameManager


class ThirdPartyStatus(BaseNameModel):
    description = models.CharField(max_length=100, blank=True)

    default = THIRD_PARTY_STATUSES[0]
    objects = DefaultNameManager()

    class Meta:
        verbose_name_plural = 'Third party statuses'


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

    class Meta:
        verbose_name_plural = 'Third parties'

    def save(self, *args, **kwargs):
        self._update_defaults()
        return super(ThirdParty, self).save(*args, **kwargs)

    def _update_defaults(self):
        if not self.status:
            self.status = ThirdPartyStatus.objects.default()
        if not self.currency:
            self.currency = Currency.objects.default()
