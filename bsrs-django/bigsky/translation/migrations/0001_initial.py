# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.contrib.postgres.operations import HStoreExtension
import uuid
import django.contrib.postgres.fields.hstore
import translation.models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        HStoreExtension(),
        migrations.CreateModel(
            name='Locale',
            fields=[
                ('id', models.UUIDField(primary_key=True, serialize=False, editable=False, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.')),
                ('locale', models.SlugField(help_text='Example values: en, en-US, en-x-Sephora')),
                ('default', models.BooleanField(default=False)),
                ('name', models.CharField(max_length=50, help_text="Human readable name in forms. i.e. 'English'")),
                ('native_name', models.CharField(null=True, max_length=50, blank=True)),
                ('presentation_name', models.CharField(null=True, max_length=50, blank=True)),
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
                ('id', models.UUIDField(primary_key=True, serialize=False, editable=False, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.')),
                ('values', django.contrib.postgres.fields.hstore.HStoreField()),
                ('context', django.contrib.postgres.fields.hstore.HStoreField(null=True, blank=True)),
                ('csv', models.FileField(upload_to=translation.models.translation_file, null=True, blank=True)),
                ('locale', models.ForeignKey(to='translation.Locale')),
            ],
            options={
                'ordering': ('id',),
                'abstract': False,
            },
        ),
    ]
