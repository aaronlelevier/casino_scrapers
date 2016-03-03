from django.contrib.contenttypes.fields import GenericRelation
from django.contrib.postgres.fields import ArrayField
from django.db import models

from decision_tree.model_choices import LINK_TYPES, NOTE_TYPES, FIELD_TYPES
from category.models import Category
from generic.models import Attachment
from ticket.models import TicketStatus, TicketPriority
from utils.models import BaseModel


class TreeData(BaseModel):
    key = models.CharField(max_length=1000)
    description = models.TextField()
    attachments = GenericRelation(Attachment)
    note = models.CharField(max_length=1000, blank=True)
    note_type = models.CharField(max_length=1000, choices=[(x,x) for x in NOTE_TYPES],
                                 blank=True, default=NOTE_TYPES[0])
    prompt = models.CharField(max_length=1000)
    link_type = models.CharField(max_length=1000, choices=[(x,x) for x in LINK_TYPES],
                                 blank=True, default=LINK_TYPES[0])


class TreeField(BaseModel):
    label = models.CharField(max_length=1000)
    type = models.CharField(max_length=100, choices=[(x,x) for x in FIELD_TYPES],
                            default=FIELD_TYPES[0])
    required = models.BooleanField(blank=True, default=False)
    tree_data = models.ForeignKey(TreeData, related_name='fields', null=True)


class TreeOption(BaseModel):
    text =  models.CharField(max_length=1000)
    order = models.IntegerField(blank=True, default=0)
    field = models.ForeignKey(TreeField, related_name='options', null=True)


class TreeLink(BaseModel):
    order = models.IntegerField(blank=True, default=0)
    text = models.CharField(max_length=1000)
    action_button = models.BooleanField(blank=True, default=False)
    is_header = models.BooleanField(blank=True, default=False)
    categories = models.ManyToManyField(Category, related_name='links')
    request = models.CharField(max_length=1000, blank=True)
    priority = models.ForeignKey(TicketPriority, null=True)
    status = models.ForeignKey(TicketStatus, null=True)
    destination = models.ForeignKey(TreeData, null=True)
    dtd = models.ForeignKey(TreeData, related_name='links', null=True)
