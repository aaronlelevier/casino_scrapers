# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-11 23:28
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0005_auto_20160730_0010'),
        ('tenant', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='tenant',
            name='countries',
            field=models.ManyToManyField(related_name='tenants', to='contact.Country'),
        ),
    ]