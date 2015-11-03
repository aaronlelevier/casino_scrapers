# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import ticket.models
from django.conf import settings
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('generic', '0002_auto_20151029_1621'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('category', '0002_category_has_children'),
        ('location', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.UUIDField(serialize=False, editable=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.')),
                ('request', models.CharField(blank=True, null=True, max_length=1000)),
                ('number', models.IntegerField(blank=True, default=ticket.models.Ticket.no_ticket_models)),
                ('assignee', models.ForeignKey(related_name='assignee_tickets', blank=True, null=True, to=settings.AUTH_USER_MODEL)),
                ('attachments', models.ManyToManyField(blank=True, related_name='tickets', to='generic.Attachment')),
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
                ('id', models.UUIDField(serialize=False, editable=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('comment', models.CharField(blank=True, null=True, max_length=1000)),
            ],
        ),
        migrations.CreateModel(
            name='TicketCategory',
            fields=[
                ('id', models.UUIDField(serialize=False, editable=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.')),
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
                ('id', models.UUIDField(serialize=False, editable=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.')),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'verbose_name_plural': 'Ticket Priorities',
            },
        ),
        migrations.CreateModel(
            name='TicketStatus',
            fields=[
                ('id', models.UUIDField(serialize=False, editable=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.')),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'verbose_name_plural': 'Ticket Statuses',
            },
        ),
        migrations.AddField(
            model_name='ticketactivity',
            name='category',
            field=models.ForeignKey(blank=True, null=True, to='ticket.TicketCategory'),
        ),
        migrations.AddField(
            model_name='ticketactivity',
            name='person',
            field=models.ForeignKey(help_text='Person who did the TicketActivity', related_name='ticket_activities', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='ticketactivity',
            name='ticket',
            field=models.ForeignKey(related_name='activities', to='ticket.Ticket'),
        ),
        migrations.AddField(
            model_name='ticket',
            name='priority',
            field=models.ForeignKey(blank=True, null=True, to='ticket.TicketPriority'),
        ),
        migrations.AddField(
            model_name='ticket',
            name='requester',
            field=models.ForeignKey(related_name='requester_tickets', blank=True, null=True, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='ticket',
            name='status',
            field=models.ForeignKey(blank=True, null=True, to='ticket.TicketStatus'),
        ),
    ]
