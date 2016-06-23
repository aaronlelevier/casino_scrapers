# -*- coding: utf-8 -*-
# Generated by Django 1.9.6 on 2016-06-23 23:09
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('assignment', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='assignee',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='assignee_profiles', to=settings.AUTH_USER_MODEL),
        ),
    ]
