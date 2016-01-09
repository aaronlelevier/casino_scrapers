# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import ticket.models
from django.conf import settings
import django.contrib.postgres.fields.hstore
import uuid
from django.contrib.postgres.operations import HStoreExtension


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('location', '0001_initial'),
        ('category', '0001_initial'),
    ]

    operations = [
        HStoreExtension(),
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('requester', models.CharField(null=True, blank=True, max_length=150)),
                ('request', models.CharField(null=True, blank=True, max_length=1000)),
                ('number', models.IntegerField(blank=True, default=ticket.models.Ticket.no_ticket_models)),
                ('assignee', models.ForeignKey(to=settings.AUTH_USER_MODEL, related_name='assignee_tickets', blank=True, null=True)),
                ('categories', models.ManyToManyField(blank=True, to='category.Category')),
                ('cc', models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL)),
                ('location', models.ForeignKey(to='location.Location')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='TicketActivity',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
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
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('weight', models.PositiveIntegerField(blank=True, default=1)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='TicketPriority',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'verbose_name_plural': 'Ticket Priorities',
            },
        ),
        migrations.CreateModel(
            name='TicketStatus',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
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
            name='status',
            field=models.ForeignKey(to='ticket.TicketStatus', blank=True, null=True),
        ),
    ]
