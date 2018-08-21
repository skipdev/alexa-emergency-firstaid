const injuries = require('./injuries')

exports.strings = {
  'en-US': {
    translation: {
      initial: {
        SKILL_NAME: 'Emergency First-aid',
        HELLO: 'Welcome to {{skillName}}. Are you currently in an emergency, or would you like advice on a certain injury?',
        INJURIES: injuries.INJURIES_EN_US,
        ADVICE_DISCLAIMER: 'Please call 911 if you are in an emergency, this is not a substitute for professional medical advice.',
        YES: 'yes',
        NO: 'no',
        OKAY: 'Okay',
        NO_PROBLEM: 'No problem.'
      }
    }
  },
  'en-GB': {
    translation: {
      initial: {
        SKILL_NAME: 'Emergency First-aid',
        HELLO: 'Hello and welcome to {{skillName}}. You can take a quiz on bleeding, choking, burns, or broken bones. Which would you like to do?',
        INJURIES: injuries.INJURIES_EN_GB,
        YES: 'yes',
        NO: 'no',
        OKAY: 'Okay'
      }
    }
  }
}
