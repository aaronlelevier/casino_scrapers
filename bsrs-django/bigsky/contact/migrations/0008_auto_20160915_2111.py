# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2016-09-15 21:11
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0007_auto_20160913_1933'),
    ]

    operations = [
        migrations.AlterField(
            model_name='email',
            name='email',
            field=models.EmailField(default='test@test.com', max_length=254),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='phonenumber',
            name='number',
            field=models.CharField(default='1234', max_length=100),
            preserve_default=False,
        ),
    ]