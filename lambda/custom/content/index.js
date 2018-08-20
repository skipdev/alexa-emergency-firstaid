const injuries = require('./injuries')

exports.strings = {
  'en-US': {
    translation: {
      initial: {
        SKILL_NAME: 'Emergency First-aid',
        HELLO: 'Welcome to {{skillName}}. Are you currently in an emergency?',
        INJURIES: injuries.INJURIES_EN_US,
        YES: 'yes',
        NO: 'no',
        OKAY: 'Okay'
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
