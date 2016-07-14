from django.conf import settings
from django.contrib.auth.models import ContentType
from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.postgres.fields import JSONField
from django.db import models
from django.dispatch import receiver
from django.db.models import Q
from django.db.models.signals import post_save

from tenant.models import Tenant
from tenant.tests.factory import get_or_create_tenant
from utils.fields import MyGenericForeignKey
from utils.models import BaseQuerySet, BaseManager, BaseModel


class AssignmentQuerySet(BaseQuerySet):

    def search_multi(self, keyword):
        return self.filter(
            Q(description=keyword) |
            Q(assignee__username=keyword)
        )


class AssignmentManager(BaseManager):

    queryset_cls = AssignmentQuerySet

    def search_multi(self, keyword):
        return self.get_queryset().search_multi(keyword)


class Assignment(BaseModel):
    tenant = models.ForeignKey(Tenant, null=True)
    order = models.IntegerField(null=True)
    description = models.CharField(max_length=500)
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL,
                                 related_name="assignments")
    filters = GenericRelation("routing.ProfileFilter")

    objects = AssignmentManager()

    class Meta:
        ordering = ['order']

    def save(self, *args, **kwargs):
        self._update_defaults()
        return super(Assignment, self).save(*args, **kwargs)

    def _update_defaults(self):
        if not self.tenant:
            self.tenant = get_or_create_tenant()


@receiver(post_save, sender=Assignment)
def update_order(sender, instance=None, created=False, **kwargs):
    "Post-save hook for incrementing order if not set"
    if not instance.order:
        instance.order = Assignment.objects.filter(tenant=instance.tenant).count()
        instance.save()


class ProfileFilter(BaseModel):
    context = models.CharField(max_length=100, blank=True, default=settings.DEFAULT_PROFILE_FILTER_CONTEXT,
                               help_text="The namespace of the model to look the field up on. ex: 'app_name.model_name'")
    field = models.CharField(max_length=100,
                             help_text="Model field to look up from the Model class specified in the 'context'")
    criteria = JSONField(help_text="Must be a list. Criteria to match on.")
    # GenericForeignKey
    content_type = models.ForeignKey(ContentType, null=True)
    object_id = models.UUIDField(null=True)
    content_object = MyGenericForeignKey('content_type', 'object_id')

    class Meta:
        ordering = ['id']
