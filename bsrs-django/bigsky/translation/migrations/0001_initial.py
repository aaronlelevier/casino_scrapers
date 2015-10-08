# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.contrib.postgres.operations import HStoreExtension
import django.contrib.postgres.fields.hstore
import translation.models
import uuid


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        HStoreExtension(),
        migrations.CreateModel(
            name='Locale',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('locale', models.SlugField(help_text='Example values: en, en-US, en-x-Sephora')),
                ('default', models.BooleanField(default=False)),
                ('name', models.CharField(help_text="Human readable name in forms. i.e. 'English'", max_length=50)),
                ('native_name', models.CharField(null=True, max_length=50, blank=True)),
                ('presentation_name', models.CharField(null=True, max_length=50, blank=True)),
                ('rtl', models.BooleanField(default=False)),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.CreateModel(
            name='Translation',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('values', django.contrib.postgres.fields.hstore.HStoreField()),
                ('context', django.contrib.postgres.fields.hstore.HStoreField(null=True, blank=True)),
                ('csv', models.FileField(null=True, upload_to=translation.models.translation_file, blank=True)),
                ('locale', models.ForeignKey(to='translation.Locale')),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
    ]
