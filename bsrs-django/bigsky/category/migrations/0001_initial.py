# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.UUIDField(primary_key=True, serialize=False, editable=False, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.CharField(null=True, max_length=100, blank=True)),
                ('label', models.CharField(null=True, max_length=100, blank=True)),
                ('subcategory_label', models.CharField(max_length=100)),
                ('cost_amount', models.DecimalField(max_digits=15, decimal_places=4, blank=True, default=0)),
                ('cost_code', models.CharField(null=True, max_length=100, blank=True)),
                ('cost_currency', models.ForeignKey(null=True, blank=True, to='accounting.Currency')),
                ('parent', models.ForeignKey(null=True, blank=True, to='category.Category', related_name='children')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
