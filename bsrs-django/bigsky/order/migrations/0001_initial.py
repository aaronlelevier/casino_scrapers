# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='WorkOrder',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('amount', models.PositiveIntegerField()),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.CreateModel(
            name='WorkOrderStatus',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
    ]
