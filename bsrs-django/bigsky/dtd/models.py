from django.contrib.contenttypes.fields import GenericRelation
from django.db import models
from django.db.models import Q

from dtd.model_choices import LINK_TYPES, NOTE_TYPES, FIELD_TYPES
from category.models import Category
from generic.models import Attachment
from ticket.models import TicketStatus, TicketPriority
from utils.models import BaseModel, BaseQuerySet, BaseManager


class TreeDataQuerySet(BaseQuerySet):

    def search_multi(self, keyword):
        return self.filter(
                Q(key__icontains=keyword) | \
                Q(description__icontains=keyword)
            )  
        

class TreeDataManager(BaseManager):
    
    def get_queryset(self):
        return TreeDataQuerySet(self.model, using=self._db).filter(deleted__isnull=True)

    def search_multi(self, keyword):
        return self.get_queryset().search_multi(keyword)


class TreeData(BaseModel):
    key = models.CharField(unique=True, max_length=254)
    description = models.TextField()
    attachments = GenericRelation(Attachment)
    note = models.CharField(max_length=1000, blank=True, null=True)
    note_type = models.CharField(max_length=1000, choices=[(x,x) for x in NOTE_TYPES],
                                 blank=True, default=NOTE_TYPES[0])
    prompt = models.CharField(max_length=1000, blank=True, null=True)
    link_type = models.CharField(max_length=1000, choices=[(x,x) for x in LINK_TYPES],
                                 blank=True, default=LINK_TYPES[0])

    objects = TreeDataManager()

    class Meta:
        ordering = ('key',)


class TreeField(BaseModel):
    order = models.IntegerField(blank=True, default=0)
    label = models.CharField(max_length=1000)
    type = models.CharField(max_length=100, choices=[(x,x) for x in FIELD_TYPES],
                            default=FIELD_TYPES[0])
    required = models.BooleanField(blank=True, default=False)
    tree_data = models.ForeignKey(TreeData, related_name='fields', null=True)


class TreeOption(BaseModel):
    order = models.IntegerField(blank=True, default=0)
    text =  models.CharField(max_length=1000)
    field = models.ForeignKey(TreeField, related_name='options', null=True)


class TreeLink(BaseModel):
    order = models.IntegerField(blank=True, default=0)
    text = models.CharField(max_length=1000)
    action_button = models.BooleanField(blank=True, default=False)
    is_header = models.BooleanField(blank=True, default=False)
    categories = models.ManyToManyField(Category, related_name='links')
    request = models.CharField(max_length=1000, blank=True, null=True)
    priority = models.ForeignKey(TicketPriority, null=True)
    status = models.ForeignKey(TicketStatus, null=True)
    destination = models.ForeignKey(TreeData, null=True)
    dtd = models.ForeignKey(TreeData, related_name='links', null=True)
