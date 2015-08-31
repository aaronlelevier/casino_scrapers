# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0005_auto_20150831_0847'),
    ]

    operations = [
        migrations.AlterField(
            model_name='currency',
            name='code',
            field=models.CharField(max_length=3, help_text='USD'),
        ),
        migrations.AlterField(
            model_name='currency',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
        migrations.AlterField(
            model_name='currency',
            name='name',
            field=models.CharField(max_length=50, help_text='US Dollar'),
        ),
        migrations.AlterField(
            model_name='currency',
            name='name_plural',
            field=models.CharField(blank=True, max_length=50, help_text='US Dollars'),
        ),
        migrations.AlterField(
            model_name='currency',
            name='symbol',
            field=models.CharField(max_length=10, help_text='$'),
        ),
        migrations.AlterField(
            model_name='currency',
            name='symbol_native',
            field=models.CharField(blank=True, max_length=10, help_text='$'),
        ),
    ]
