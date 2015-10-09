from model_mommy import mommy

from third_party.models import ThirdParty

def create_third_parties():
    '''
    Third Party Contactors with unique name
    '''
    third_party = mommy.make(ThirdParty, name="ABC_CONTRACTOR")
    third_party = mommy.make(ThirdParty, name="DEF_CONTRACTOR")
    third_party = mommy.make(ThirdParty, name="GHI_CONTRACTOR")

