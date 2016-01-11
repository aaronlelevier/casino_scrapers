# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django_fsm
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkRequest',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, verbose_name='ID', serialize=False)),
                ('request', models.CharField(null=True, blank=True, max_length=254)),
                ('approver', models.ForeignKey(to=settings.AUTH_USER_MODEL, blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='WorkRequestStatus',
            fields=[
                ('id', models.CharField(max_length=50, primary_key=True, default='def11673-d4ab-41a6-a37f-0c6846b96006', editable=False, serialize=False)),
                ('label', models.CharField(help_text="String value of the ID 'key'.", blank=True, max_length=254)),
            ],
        ),
        migrations.AddField(
            model_name='workrequest',
            name='status',
            field=django_fsm.FSMKeyField(default='new', to='work_request.WorkRequestStatus', protected=True),
        ),
    ]
