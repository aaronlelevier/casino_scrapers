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
                ('id', models.UUIDField(primary_key=True, serialize=False, editable=False, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.')),
                ('name', models.CharField(max_length=50, help_text='US Dollar')),
                ('name_plural', models.CharField(max_length=50, blank=True, help_text='US Dollars')),
                ('code', models.CharField(max_length=3, help_text='USD')),
                ('symbol', models.CharField(max_length=10, help_text='$')),
                ('symbol_native', models.CharField(max_length=10, blank=True, help_text='$')),
                ('decimal_digits', models.IntegerField(blank=True, default=0)),
                ('rounding', models.IntegerField(blank=True, default=0)),
            ],
            options={
                'verbose_name_plural': 'Currencies',
            },
        ),
    ]
