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
                ('id', models.UUIDField(editable=False, serialize=False, primary_key=True, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('name', models.CharField(max_length=50, help_text='US Dollar')),
                ('name_plural', models.CharField(max_length=50, help_text='US Dollars', blank=True)),
                ('code', models.CharField(max_length=3, help_text='USD')),
                ('symbol', models.CharField(max_length=10, help_text='$')),
                ('symbol_native', models.CharField(max_length=10, help_text='$', blank=True)),
                ('decimal_digits', models.IntegerField(default=0, blank=True)),
                ('rounding', models.IntegerField(default=0, blank=True)),
            ],
            options={
                'ordering': ('id',),
                'verbose_name_plural': 'Currencies',
            },
        ),
    ]
