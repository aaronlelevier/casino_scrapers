# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.contrib.postgres.operations import HStoreExtension
import translation.models
<<<<<<< HEAD
=======
import django.contrib.postgres.fields.hstore
>>>>>>> master
import uuid
import django.contrib.postgres.fields.hstore


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        HStoreExtension(),
        migrations.CreateModel(
            name='Locale',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('locale', models.SlugField(help_text='Example values: en, en-US, en-x-Sephora')),
                ('default', models.BooleanField(default=False)),
                ('name', models.CharField(max_length=50, help_text="Human readable name in forms. i.e. 'English'")),
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
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
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
