import json
import sys
import uuid

from translation.models import Locale


def model_to_json(model):
    return json.dumps([m.to_dict() for m in model.objects.all()])


def model_to_json_select_related(model, select=[]):
    return json.dumps([m.to_dict() for m in model.objects.all().select_related(*select)])


def choices_to_json(model):
    return json.dumps([m[0] for m in model])


def generate_uuid(base_id, incr=0):
    return "{}{:03d}".format(base_id, incr)
