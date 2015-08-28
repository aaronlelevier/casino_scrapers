# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import translation.models
import django.contrib.postgres.fields.hstore
from django.contrib.postgres.operations import HStoreExtension
import uuid


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        HStoreExtension(),
        migrations.CreateModel(
            name='Locale',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
                ('locale', models.SlugField(help_text=b'Example values: en, en-US, en-x-Sephora', unique=True)),
                ('default', models.BooleanField(default=False)),
                ('name', models.CharField(help_text=b"Human readable name in forms. i.e. 'English'", max_length=50)),
                ('native_name', models.CharField(max_length=50, null=True, blank=True)),
                ('presentation_name', models.CharField(max_length=50, null=True, blank=True)),
                ('rtl', models.BooleanField(default=False)),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Translation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, serialize=False, editable=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text=b'If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True, blank=True)),
                ('values', django.contrib.postgres.fields.hstore.HStoreField()),
                ('context', django.contrib.postgres.fields.hstore.HStoreField(null=True, blank=True)),
                ('csv', models.FileField(null=True, upload_to=translation.models.translation_file, blank=True)),
                ('locale', models.ForeignKey(to='translation.Locale')),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
    ]
