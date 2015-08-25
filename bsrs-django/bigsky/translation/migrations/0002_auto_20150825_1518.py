# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.postgres.fields.hstore
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('translation', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Translation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
                ('values', django.contrib.postgres.fields.hstore.HStoreField()),
                ('language', models.ForeignKey(to='translation.Locale')),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
        migrations.RemoveField(
            model_name='definition',
            name='language',
        ),
        migrations.DeleteModel(
            name='Definition',
        ),
    ]
