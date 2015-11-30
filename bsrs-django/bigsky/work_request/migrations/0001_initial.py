# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings
import django_fsm


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkRequest',
            fields=[
                ('id', models.AutoField(serialize=False, auto_created=True, primary_key=True, verbose_name='ID')),
                ('request', models.CharField(blank=True, null=True, max_length=254)),
                ('approver', models.ForeignKey(to=settings.AUTH_USER_MODEL, blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='WorkRequestStatus',
            fields=[
                ('id', models.CharField(serialize=False, editable=False, default='def11673-d4ab-41a6-a37f-0c6846b96006', max_length=50, primary_key=True)),
                ('label', models.CharField(blank=True, help_text="String value of the ID 'key'.", max_length=254)),
            ],
        ),
        migrations.AddField(
            model_name='workrequest',
            name='status',
            field=django_fsm.FSMKeyField(to='work_request.WorkRequestStatus', default='new', protected=True),
        ),
    ]
