from django.contrib.postgres.fields import ArrayField
from django.db import models

from category.models import Category
from generic.models import Attachment
from ticket.models import TicketStatus, TicketPriority
from utils.models import BaseModel


LINK_TYPES = ['buttons', 'links']
NOTE_TYPES = ['success', 'info', 'warning', 'danger']
FIELD_TYPES = ['text', 'textarea', 'select', 'checkbox', 'file', 'asset select',
               'check in', 'check out']


class TreeField(BaseModel):
    label = models.CharField(max_length=100)
    type = models.CharField(max_length=100)
    required = models.BooleanField(blank=True, default=False)


class TreeOption(BaseModel):
    text =  models.CharField(max_length=100)
    order = models.IntegerField(blank=True, default=0)
    field = models.ForeignKey(TreeField, related_name='options', null=True)


class TreeData(BaseModel):
    key = models.CharField(max_length=1000)
    description = models.CharField(max_length=1000)
    files = models.ManyToManyField(Attachment)
    fields = models.ManyToManyField(TreeField)
    note = models.CharField(max_length=1000, blank=True)
    note_type = models.CharField(max_length=1000, choices=[(x,x) for x in NOTE_TYPES],
                                 blank=True, default=NOTE_TYPES[0])
    prompt = models.CharField(max_length=1000)
    link_type = models.CharField(max_length=1000, choices=[(x,x) for x in LINK_TYPES],
                                 blank=True, default=LINK_TYPES[0])


class TreeLink(BaseModel):
    order = models.IntegerField(blank=True, default=0)
    text = models.CharField(max_length=100)
    action_button = models.BooleanField(blank=True, default=False)
    is_header = models.BooleanField(blank=True, default=False)
    categories = models.ManyToManyField(Category)
    request = models.CharField(max_length=1000, blank=True)
    priority = models.ForeignKey(TicketPriority, null=True)
    status = models.ForeignKey(TicketStatus, null=True)
    destination = models.OneToOneField(TreeData, related_name='parent_link', null=True)
    child_data = models.ManyToManyField(TreeData, related_name='links')
