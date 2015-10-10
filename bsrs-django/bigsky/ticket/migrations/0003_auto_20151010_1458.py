# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0002_auto_20151009_1527'),
    ]

    operations = [
        migrations.CreateModel(
            name='TicketPriority',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('description', models.CharField(default='Urgent', choices=[('Urgent', 'Urgent'), ('Non Urgent', 'Non Urgent')], max_length=100)),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
        migrations.AlterField(
            model_name='ticketstatus',
            name='description',
            field=models.CharField(default='New', choices=[('New', 'New'), ('Deferred', 'Deferred'), ('In Progress', 'In Progress'), ('Complete', 'Complete'), ('Denied', 'Denied'), ('Problem Solved', 'Problem Solved'), ('Draft', 'Draft'), ('Unsatisfactory Completion', 'Unsatisfactory Completion')], max_length=100),
        ),
        migrations.AddField(
            model_name='ticket',
            name='priority',
            field=models.ForeignKey(null=True, to='ticket.TicketPriority', blank=True),
        ),
    ]
