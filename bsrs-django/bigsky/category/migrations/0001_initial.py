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
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('name', models.CharField(max_length=100)),
                ('description', models.CharField(null=True, max_length=100, blank=True)),
                ('label', models.CharField(null=True, editable=False, help_text='This field cannot be set directly.  It is either set from a system setting, or defaulted from the Parent Category.', blank=True, max_length=100)),
                ('subcategory_label', models.CharField(max_length=100)),
                ('cost_amount', models.DecimalField(decimal_places=4, default=0, blank=True, max_digits=15)),
                ('cost_code', models.CharField(null=True, max_length=100, blank=True)),
                ('cost_currency', models.ForeignKey(null=True, blank=True, to='accounting.Currency')),
                ('parent', models.ForeignKey(null=True, blank=True, related_name='children', to='category.Category')),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.CreateModel(
            name='CategoryStatus',
            fields=[
                ('id', models.UUIDField(editable=False, default=uuid.uuid4, serialize=False, primary_key=True)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(null=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True)),
                ('name', models.CharField(unique=True, max_length=100)),
                ('description', models.CharField(default='active', max_length=100, choices=[('active', 'active'), ('two', 'two')])),
            ],
            options={
                'abstract': False,
                'ordering': ('id',),
            },
        ),
        migrations.AddField(
            model_name='category',
            name='status',
            field=models.ForeignKey(null=True, blank=True, to='category.CategoryStatus'),
        ),
    ]
