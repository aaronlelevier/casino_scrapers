from django.conf import settings
from django.db import models
from django.db.models import Q

from utils.models import BaseQuerySet, BaseManager, BaseModel


class AssignmentQuerySet(BaseQuerySet):

    def search_multi(self, keyword):
        return self.filter(
            Q(description=keyword) | \
            Q(assignee__username=keyword)
        )


class AssignmentManager(BaseManager):

    queryset_cls = AssignmentQuerySet

    def search_multi(self, keyword):
        return self.get_queryset().search_multi(keyword)


class Assignment(BaseModel):
    description = models.CharField(max_length=500, unique=True)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL,
                                 related_name="assignments")

    objects = AssignmentManager()