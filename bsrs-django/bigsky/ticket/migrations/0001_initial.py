# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid
import ticket.models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('category', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('subject', models.TextField(max_length=100, null=True)),
                ('number', models.IntegerField(default=ticket.models.Ticket.no_ticket_models)),
                ('request', models.TextField(max_length=100, null=True)),
                ('assignee', models.ForeignKey(to=settings.AUTH_USER_MODEL, blank=True, null=True, related_name='person_ticket_assignee')),
                ('categories', models.ManyToManyField(to='category.Category', blank=True)),
                ('cc', models.ManyToManyField(to=settings.AUTH_USER_MODEL, blank=True)),
                ('location', models.ForeignKey(to='location.Location', null=True)),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='TicketPriority',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(default='New', max_length=50)),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='TicketStatus',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(default='New', max_length=50)),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='ticket',
            name='priority',
            field=models.ForeignKey(to='ticket.TicketPriority'),
        ),
        migrations.AddField(
            model_name='ticket',
            name='requester',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL, blank=True, null=True, related_name='person_ticket_requester'),
        ),
        migrations.AddField(
            model_name='ticket',
            name='status',
            field=models.ForeignKey(to='ticket.TicketStatus'),
        ),
    ]
