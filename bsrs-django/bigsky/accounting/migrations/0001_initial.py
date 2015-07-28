# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Currency',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
                ('name', models.CharField(max_length=50)),
                ('code', models.CharField(max_length=3)),
                ('symbol', models.CharField(help_text=b'$, ', max_length=1)),
                ('format', models.CharField(help_text=b"$00.00 for 'USD' for example", max_length=10)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
