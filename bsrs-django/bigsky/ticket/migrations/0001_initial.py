# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import ticket.models
import uuid
import django.contrib.postgres.fields.hstore
from django.contrib.postgres.operations import HStoreExtension
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0001_initial'),
        ('category', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        HStoreExtension(),
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('request', models.CharField(blank=True, max_length=1000, null=True)),
                ('number', models.IntegerField(default=ticket.models.Ticket.no_ticket_models, blank=True)),
                ('assignee', models.ForeignKey(to=settings.AUTH_USER_MODEL, blank=True, related_name='assignee_tickets', null=True)),
                ('categories', models.ManyToManyField(to='category.Category', blank=True)),
                ('cc', models.ManyToManyField(to=settings.AUTH_USER_MODEL, blank=True)),
                ('location', models.ForeignKey(to='location.Location')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='TicketActivity',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('content', django.contrib.postgres.fields.hstore.HStoreField(blank=True, null=True)),
                ('person', models.ForeignKey(to=settings.AUTH_USER_MODEL, related_name='ticket_activities', help_text='Person who did the TicketActivity')),
                ('ticket', models.ForeignKey(related_name='activities', to='ticket.Ticket')),
            ],
            options={
                'ordering': ('-created',),
            },
        ),
        migrations.CreateModel(
            name='TicketActivityType',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('weight', models.PositiveIntegerField(default=1, blank=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='TicketPriority',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'verbose_name_plural': 'Ticket Priorities',
            },
        ),
        migrations.CreateModel(
            name='TicketStatus',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'verbose_name_plural': 'Ticket Statuses',
            },
        ),
        migrations.AddField(
            model_name='ticketactivity',
            name='type',
            field=models.ForeignKey(to='ticket.TicketActivityType', blank=True, null=True),
        ),
        migrations.AddField(
            model_name='ticket',
            name='priority',
            field=models.ForeignKey(to='ticket.TicketPriority', blank=True, null=True),
        ),
        migrations.AddField(
            model_name='ticket',
            name='requester',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL, blank=True, related_name='requester_tickets', null=True),
        ),
        migrations.AddField(
            model_name='ticket',
            name='status',
            field=models.ForeignKey(to='ticket.TicketStatus', blank=True, null=True),
        ),
    ]
