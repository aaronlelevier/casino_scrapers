# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2016-07-30 00:10
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0004_auto_20160729_2326'),
    ]

    operations = [
        migrations.AlterField(
            model_name='state',
            name='country',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='states', to='contact.Country'),
        ),
    ]
