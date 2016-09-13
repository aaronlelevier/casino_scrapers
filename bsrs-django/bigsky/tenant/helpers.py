import os
import requests


DEV_SC_USER_ID = os.environ['DEV_SC_USER_ID']
DEV_SC_USER_PASSWORD = os.environ['DEV_SC_USER_PASSWORD']
DEV_SC_CLIENT_ID = os.environ['DEV_SC_CLIENT_ID']
DEV_SC_CLIENT_SECRET = os.environ['DEV_SC_CLIENT_SECRET']

DEV_SC_TOKEN_URL = "https://dev1login.servicechannel.com/oauth/token"
SC_GRANT_TYPE = 'password'


def request_token():
    params = {
        'grant_type': SC_GRANT_TYPE,
        'username': DEV_SC_USER_ID,
        'password': DEV_SC_USER_PASSWORD
    }
    return requests.post(DEV_SC_TOKEN_URL, data=params,
                         auth=(DEV_SC_CLIENT_ID, DEV_SC_CLIENT_SECRET))
