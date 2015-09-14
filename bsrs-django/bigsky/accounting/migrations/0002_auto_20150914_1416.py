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
            field=models.CharField(help_text='USD', max_length=3),
        ),
        migrations.AlterField(
            model_name='currency',
            name='deleted',
            field=models.DateTimeField(null=True, blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.'),
        ),
        migrations.AlterField(
            model_name='currency',
            name='name',
            field=models.CharField(help_text='US Dollar', max_length=50),
        ),
        migrations.AlterField(
            model_name='currency',
            name='name_plural',
            field=models.CharField(blank=True, help_text='US Dollars', max_length=50),
        ),
        migrations.AlterField(
            model_name='currency',
            name='symbol',
            field=models.CharField(help_text='$', max_length=10),
        ),
        migrations.AlterField(
            model_name='currency',
            name='symbol_native',
            field=models.CharField(blank=True, help_text='$', max_length=10),
        ),
    ]
