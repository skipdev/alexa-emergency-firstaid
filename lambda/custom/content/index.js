const injuries = require('./injuries')

exports.strings = {
  'en-US': {
    translation: {
      initial: {
        SKILL_NAME: 'Emergency First-aid',
        HELLO: 'Welcome to {{skillName}}. Are you currently in an emergency, or would you like advice on a certain injury?',
        OPTIONS: 'Are you currently in an emergency, or would you like advice on a certain injury?',
        HELP: 'I can call an ambulance if you\'re in an emergency, or you can ask me for advice on a certain injury.',
        INJURIES: injuries.INJURIES_EN_US,
        ADVICE_DISCLAIMER: 'Please call 911 if you are in an emergency, this is not a substitute for professional medical advice.',
        CALL_PROMPT: 'Should I call 911?',
        CALL_CONFIRMED: 'Okay, calling now.',
        CALL_DECLINED: 'Okay, I won\'t call them.',
        INJURY_PROMPT: 'Okay, which injury?',
        FIRST_STEP_TEXT: 'Here is your first step: ',
        LAST_STEP_TEXT: 'Final step: ',
        REPEAT_PROMPT: 'You have now completed all the necessary steps. Would you like help with anything else?',
        HELP_PROMPT: 'Would you like help with anything else?',
        USER_ENDING: 'Okay, you can come back at any time by saying Alexa, open emergency first-aid',
        YES: 'yes',
        NO: 'no',
        OKAY: 'Okay',
        NO_PROBLEM: 'No problem.',
        BYE: 'Bye!'
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
