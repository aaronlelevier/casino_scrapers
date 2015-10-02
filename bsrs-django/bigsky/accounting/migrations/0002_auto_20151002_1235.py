# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0001_initial'),
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
            field=models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='currency',
            name='name',
            field=models.CharField(max_length=50, help_text='US Dollar'),
        ),
        migrations.AlterField(
            model_name='currency',
            name='name_plural',
            field=models.CharField(max_length=50, help_text='US Dollars', blank=True),
        ),
        migrations.AlterField(
            model_name='currency',
            name='symbol',
            field=models.CharField(max_length=10, help_text='$'),
        ),
        migrations.AlterField(
            model_name='currency',
            name='symbol_native',
            field=models.CharField(max_length=10, help_text='$', blank=True),
        ),
    ]
