from django.db import models

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
    Third Party model
    '''
    number = models.CharField(max_length=50, blank=True, null=True)
    status = models.ForeignKey(ThirdPartyStatus, blank=True, null=True)
