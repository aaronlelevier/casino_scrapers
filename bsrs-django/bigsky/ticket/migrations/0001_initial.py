# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Ticket',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.')),
                ('subject', models.TextField(blank=True, null=True, max_length=100)),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
    ]
