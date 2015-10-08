from model_mommy import mommy

from third_party.models import ThirdParty
from utils.create import _generate_chars

def create_third_party():
    '''
    '''
    contractor = mommy.make(ThirdParty)
    contractor = mommy.make(ThirdParty)
    contractor = mommy.make(ThirdParty)

