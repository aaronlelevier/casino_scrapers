# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings
import ticket.models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('location', '0001_initial'),
        ('category', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('subject', models.TextField(max_length=100, null=True)),
                ('number', models.IntegerField(default=ticket.models.Ticket.no_ticket_models)),
                ('request', models.TextField(max_length=100, null=True)),
                ('assignee', models.ForeignKey(related_name='person_ticket_assignee', blank=True, to=settings.AUTH_USER_MODEL, null=True)),
                ('categories', models.ManyToManyField(blank=True, to='category.Category')),
                ('cc', models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL)),
                ('location', models.ForeignKey(to='location.Location')),
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
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(max_length=50, default='New')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='TicketStatus',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(max_length=50, default='New')),
            ],
            options={
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
            field=models.ForeignKey(related_name='person_ticket_requester', blank=True, to=settings.AUTH_USER_MODEL, null=True),
        ),
        migrations.AddField(
            model_name='ticket',
            name='status',
            field=models.ForeignKey(to='ticket.TicketStatus'),
        ),
    ]
