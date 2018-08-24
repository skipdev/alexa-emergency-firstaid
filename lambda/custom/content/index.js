const injuries = require('./injuries')

exports.strings = {
  'en-US': {
    translation: {
      initial: {
        SKILL_NAME: 'Emergency First-aid',
        HELLO: 'Welcome to {{skillName}}.',
        INJURY_QUESTION: 'Would you like advice on a certain injury?',
        EMERGENCY_PROMPT: 'Are you currently in an emergency?',
        HELP: 'I can tell you symptoms, or give you advice on how to treat a certain injury.',
        HELP_2: 'Which would you like me to do?',
        INJURIES: injuries.INJURIES_EN_US,
        ADVICE_DISCLAIMER: 'Please call 911 if you are in an emergency, this is not a substitute for professional medical advice.',
        NO_COMMAND_SPECIFIED_1: 'You can say \"advice on',
        NO_COMMAND_SPECIFIED_2: 'to get advice, or',
        NO_COMMAND_SPECIFIED_3: 'symptoms\" to hear about the symptoms',
        SAY_NEXT: 'You can say \"next\" to go to the next step.',
        CALL_PROMPT: 'Have you called 911?',
        CALL_CONFIRMED: 'good. Help will be on their way soon. In the meantime, try and stay calm. You can ask for advice on your injury while waiting for the ambulance by saying \"advice on\", followed by your injury.',
        CALL_DECLINED: 'If you are in an emergency, please call 911 immediately, or get someone nearby to call for you. Please do not proceed any further until this is done.',
        INJURY_PROMPT: 'Which injury would you like advice on?',
        SYMPTOM_PROMPT: 'Which injury would you like the symptoms of?',
        FIRST_STEP_TEXT: 'Here is the first step for',
        FINAL_STEP_TEXT: 'Final step:',
        REPEAT_PROMPT: 'You have now completed all the necessary steps.',
        HELP_PROMPT: 'Would you like help with anything else?',
        USER_ENDING: 'you can come back at any time by saying Alexa, open emergency first-aid.',
        SYMPTOM_INTRO: 'Symptoms of',
        INCLUDE: 'include:',
        CALL_IF_IN_DOUBT: 'If in doubt, always call 911.',
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
         HELLO: 'Welcome to {{skillName}}. Are you currently in an emergency?',
         INJURY_QUESTION: 'Would you like advice on a certain injury?',
         OPTIONS: 'Are you currently in an emergency, or would you like advice on a certain injury?',
         HELP: 'I can call an ambulance if you\'re in an emergency, or you can ask me for advice on a certain injury. To move between steps, you can say \"next step\", \"repeat\", or \"previous step\".',
         INJURIES: injuries.INJURIES_EN_US,
         ADVICE_DISCLAIMER: 'Please call 999 if you are in an emergency, this is not a substitute for professional medical advice.',
         SAY_NEXT: 'You can say \"next\" to go to the next step.',
         CALL_PROMPT: 'Have you called 999?',
         CALL_CONFIRMED: 'good. Help will be on their way soon. In the meantime, try and stay calm. You can ask for advice on your injury while waiting for the ambulance.',
         CALL_DECLINED: 'If you are in an emergency, please call 999 immediately, or get someone nearby to call for you.',
         INJURY_PROMPT: 'which injury?',
         FIRST_STEP_TEXT: 'Here is your first step:',
         FINAL_STEP_TEXT: 'Final step:',
         REPEAT_PROMPT: 'You have now completed all the necessary steps.',
         HELP_PROMPT: 'Would you like help with anything else?',
         USER_ENDING: 'you can come back at any time by saying Alexa, open emergency first-aid.',
         YES: 'yes',
         NO: 'no',
         OKAY: 'Okay',
         NO_PROBLEM: 'No problem.',
         BYE: 'Bye!'
      }
    }
  }
}
