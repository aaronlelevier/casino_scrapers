import json

from django.db import models
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.utils.encoding import python_2_unicode_compatible

from utils.models import BaseNameModel, BaseModel, BaseManager
from utils import choices


class ThirdPartyStatusManager(BaseManager):

    def default(self):
        obj, created = self.get_or_create(description=choices.CONTRACTOR_STATUS_CHOICES[0][0])
        return obj


class ThirdPartyStatus(BaseNameModel):
    description = models.CharField(max_length=100, choices=choices.CONTRACTOR_STATUS_CHOICES,
        default=choices.CONTRACTOR_STATUS_CHOICES[0][0])

    objects = ThirdPartyStatusManager()


class ThirdParty(BaseModel):
    '''
    Contractor model
    '''
    number = models.CharField(max_length=50, blank=True, null=True)
    status = models.ForeignKey(ThirdPartyStatus, blank=True, null=True)
