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


class TreeOption(BaseModel):
    text = models.CharField(max_length=100)
    order = models.IntegerField(blank=True, default=0)


class TreeData(BaseModel):
    key = models.CharField(max_length=1000)
    description = models.CharField(max_length=1000)
    files = models.ManyToManyField(Attachment)
    field_label = models.CharField(max_length=1000)
    field_type = models.CharField(max_length=1000, choices=[(x,x) for x in FIELD_TYPES],
                                  blank=True, default=FIELD_TYPES[0])
    options = models.ForeignKey(TreeOption, null=True)
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
    tree_data_parent = models.ForeignKey(TreeData, related_name='tree_data_parent', null=True)
    tree_data_links = models.ManyToManyField(TreeData, related_name='tree_data_links')
