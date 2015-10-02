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
                ('name', models.CharField(help_text=b'US Dollar', max_length=50)),
                ('name_plural', models.CharField(help_text=b'US Dollars', max_length=50, blank=True)),
                ('code', models.CharField(help_text=b'USD', max_length=3)),
                ('symbol', models.CharField(help_text=b'$', max_length=10)),
                ('symbol_native', models.CharField(help_text=b'$', max_length=10, blank=True)),
                ('decimal_digits', models.IntegerField(default=0, blank=True)),
                ('rounding', models.IntegerField(default=0, blank=True)),
            ],
            options={
                'ordering': ('id',),
                'verbose_name_plural': 'Currencies',
            },
        ),
    ]
