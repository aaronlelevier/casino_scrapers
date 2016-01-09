# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(max_length=100)),
                ('description', models.CharField(null=True, blank=True, max_length=100)),
                ('label', models.CharField(help_text='This field cannot be set directly.  It is either set from a system setting, or defaulted from the Parent Category.', blank=True, max_length=100, editable=False, null=True)),
                ('subcategory_label', models.CharField(max_length=100)),
                ('cost_amount', models.DecimalField(decimal_places=4, blank=True, default=0, max_digits=15)),
                ('cost_code', models.CharField(null=True, blank=True, max_length=100)),
                ('level', models.IntegerField(blank=True, default=0)),
                ('cost_currency', models.ForeignKey(to='accounting.Currency', blank=True, null=True)),
                ('parent', models.ForeignKey(to='category.Category', related_name='children', blank=True, null=True)),
            ],
            options={
                'ordering': ('level',),
            },
        ),
        migrations.CreateModel(
            name='CategoryStatus',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'verbose_name_plural': 'Category Statuses',
            },
        ),
        migrations.AddField(
            model_name='category',
            name='status',
            field=models.ForeignKey(to='category.CategoryStatus', blank=True, null=True),
        ),
    ]
