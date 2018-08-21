const topics = require('./helpers/topics')
const Alexa = require('ask-sdk-core')
const Interceptors = require('./interceptors')()
const Handlers = require('./handlers')()
const defaultHandlers = Handlers.getDefaultHandlers()

const HelpIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
  },
  handle (handlerInput) {
    const { attributesManager } = handlerInput
    const requestAttributes = attributesManager.getRequestAttributes()
    const speechText = requestAttributes.t('initial.OPTIONS')
    const skillName = requestAttributes.t('initial.SKILL_NAME')

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(skillName, speechText)
      .getResponse()
  }
}

const ThanksIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'ThanksIntent'
  },
  handle (handlerInput) {
     const { attributesManager} = handlerInput
     const requestAttributes = attributesManager.getRequestAttributes()
     const speechText = requestAttributes.t('initial.NO_PROBLEM')

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse()
  }
}

const EmergencyIntentHandler = {
   canHandle (handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
         (handlerInput.requestEnvelope.request.intent.name === 'YesIntent' ||
         handlerInput.requestEnvelope.request.intent.name === 'EmergencyIntent' ||
         handlerInput.requestEnvelope.request.intent.name === 'InjuryPromptIntent' ||
            handlerInput.requestEnvelope.request.intent.name === 'NoIntent')
   },
   handle (handlerInput) {
      const { responseBuilder, attributesManager} = handlerInput
      const sessionAttributes = attributesManager.getSessionAttributes()
      const requestName = handlerInput.requestEnvelope.request.intent.name
      sessionAttributes.speechText = ''

      if (requestName === 'EmergencyIntent') {
         sessionAttributes.speechText = 'Should I call 911?'
         sessionAttributes.emergencyCall = 1
      }
      else if (requestName === 'InjuryPromptIntent') {
         sessionAttributes.speechText = 'Okay, which injury?'
      }
      else if (requestName === 'YesIntent') {
         if (sessionAttributes.resetFlow === 1) {
            sessionAttributes.speechText = "Are you in an emergency, or would you like help with an injury?"
            sessionAttributes.resetFlow = 0
         }
         else if (sessionAttributes.emergencyCall === 1) {
            sessionAttributes.speechText = 'Okay, calling now.'
         }
      }
      else if (requestName === 'NoIntent') {
         if (sessionAttributes.resetFlow === 1) {
            sessionAttributes.speechText = "Okay, bye."
            return handlerInput.responseBuilder
               .speak(sessionAttributes.speechText)
               .withShouldEndSession(true)
               .getResponse()
         }
         else if (sessionAttributes.emergencyCall === 1) {
            sessionAttributes.speechText = 'Okay, I won\'t call them.'
         }
      }

      attributesManager.setSessionAttributes(sessionAttributes)
      return responseBuilder
         .speak(sessionAttributes.speechText)
         .reprompt(sessionAttributes.speechText)
         .getResponse()
   }
}

const InjuryIntentHandler = {
   canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
         (handlerInput.requestEnvelope.request.intent.name === 'InjuryIntent' ||
            handlerInput.requestEnvelope.request.intent.name === 'YesIntent' ||
            handlerInput.requestEnvelope.request.intent.name === 'NoIntent')
   },
   handle(handlerInput) {
      const {responseBuilder, attributesManager} = handlerInput
      const requestAttributes = attributesManager.getRequestAttributes()
      const sessionAttributes = attributesManager.getSessionAttributes()
      const disclaimer = requestAttributes.t('initial.ADVICE_DISCLAIMER')
      sessionAttributes.injury = handlerInput.requestEnvelope.request.intent.slots.injury
      const injuryList = requestAttributes.t('initial.INJURIES')

      // the user's injury
      const injury = sessionAttributes.injury
      if (injury && injury.value) {
         sessionAttributes.userInjury = injury.value.toLowerCase()
      }

      const userInjury = sessionAttributes.userInjury

      // the user's current step
      sessionAttributes.counter = 0
      const counter = sessionAttributes.counter
      sessionAttributes.currentStep = injuryList[userInjury][counter].text
      const currentStep = sessionAttributes.currentStep

      sessionAttributes.speechText = disclaimer + ' ' + 'Here is your first step: ' + currentStep

      attributesManager.setSessionAttributes(sessionAttributes)
      return responseBuilder
         .speak(sessionAttributes.speechText)
         .reprompt(sessionAttributes.speechText)
         .getResponse()
   }
}

const NextIntentHandler = {
   canHandle (handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
         handlerInput.requestEnvelope.request.intent.name === 'NextIntent'
   },
   handle (handlerInput) {
      const {responseBuilder, attributesManager} = handlerInput
      const requestAttributes = attributesManager.getRequestAttributes()
      const sessionAttributes = attributesManager.getSessionAttributes()
      const injuryList = requestAttributes.t('initial.INJURIES')
      const userInjury = sessionAttributes.userInjury
      const noOfSteps = ((Object.keys(injuryList[userInjury]).length) - 1)
      sessionAttributes.counter += 1
      const counter = sessionAttributes.counter
      sessionAttributes.currentStep = injuryList[userInjury][counter].text
      const currentStep = sessionAttributes.currentStep
      sessionAttributes.resetFlow = 0

      if (counter === noOfSteps) {
        sessionAttributes.speechText = 'Final step: ' + currentStep + '. You have now completed all the necessary steps. Would you like help with anything else?'
        sessionAttributes.resetFlow = 1
      } else {
         sessionAttributes.speechText = currentStep
      }

      attributesManager.setSessionAttributes(sessionAttributes)
      return responseBuilder
         .speak(sessionAttributes.speechText)
         .reprompt(sessionAttributes.speechText)
         .getResponse()
   }
}
const RepeatIntentHandler = {
   canHandle (handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
         handlerInput.requestEnvelope.request.intent.name === 'RepeatIntent'
   },
   handle (handlerInput) {
      const {responseBuilder, attributesManager} = handlerInput
      const requestAttributes = attributesManager.getRequestAttributes()
      const sessionAttributes = attributesManager.getSessionAttributes()
      const injuryList = requestAttributes.t('initial.INJURIES')
      const userInjury = sessionAttributes.userInjury
      const noOfSteps = ((Object.keys(injuryList[userInjury]).length) - 1)
      const counter = sessionAttributes.counter
      sessionAttributes.currentStep = injuryList[userInjury][counter].text
      const currentStep = sessionAttributes.currentStep
      sessionAttributes.resetFlow = 0

      if (counter === noOfSteps) {
        sessionAttributes.speechText = currentStep + '. You have now completed all the necessary steps. Would you like help with anything else?'
        sessionAttributes.resetFlow = 1
      } else {
         sessionAttributes.speechText = currentStep
      }

      attributesManager.setSessionAttributes(sessionAttributes)
      return responseBuilder
         .speak(sessionAttributes.speechText)
         .reprompt(sessionAttributes.speechText)
         .getResponse()
   }
}
const PreviousIntentHandler = {
   canHandle (handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
         handlerInput.requestEnvelope.request.intent.name === 'PreviousIntent'
   },
   handle (handlerInput) {
      const {responseBuilder, attributesManager} = handlerInput
      const requestAttributes = attributesManager.getRequestAttributes()
      const sessionAttributes = attributesManager.getSessionAttributes()
      const injuryList = requestAttributes.t('initial.INJURIES')
      const userInjury = sessionAttributes.userInjury
      const noOfSteps = ((Object.keys(injuryList[userInjury]).length) - 1)
      sessionAttributes.counter -= 1
      const counter = sessionAttributes.counter
      sessionAttributes.currentStep = injuryList[userInjury][counter].text
      const currentStep = sessionAttributes.currentStep
      sessionAttributes.resetFlow = 0

      if (counter === noOfSteps) {
        sessionAttributes.speechText = currentStep + '. You have now completed all the necessary steps. Would you like help with anything else?'
        sessionAttributes.resetFlow = 1
      } else {
         sessionAttributes.speechText = currentStep
      }

      attributesManager.setSessionAttributes(sessionAttributes)
      return responseBuilder
         .speak(sessionAttributes.speechText)
         .reprompt(sessionAttributes.speechText)
         .getResponse()
   }
}

const CancelAndStopIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
        handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent')
  },
  handle (handlerInput) {
    const { responseBuilder, attributesManager } = handlerInput
    const requestAttributes = attributesManager.getRequestAttributes()
    const sessionAttributes = attributesManager.getSessionAttributes()
    const skillName = requestAttributes.t('initial.SKILL_NAME')
    const byeMessages = requestAttributes.t('initial.BYE_MESSAGES')
    const byeNumber = Math.floor(Math.random() * byeMessages.length)
    let speechText = ''
    let questionTotal = ''
    let scoreNumber = ''

    if (sessionAttributes.score) {
       scoreNumber = sessionAttributes.score
       questionTotal = sessionAttributes.quizLength
    }

      if (scoreNumber === questionTotal) {
        speechText = requestAttributes.t('initial.ALL_ANSWERS_CORRECT') + ' ' + byeMessages[byeNumber] + '!'
      } else {
      speechText = byeMessages[byeNumber]
      }

    return responseBuilder
      .speak(speechText)
      .withSimpleCard(skillName, byeMessages[byeNumber] + '!')
      .getResponse()
  }
}

const SessionEndedRequestHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
  },
  handle (handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`)

    return handlerInput.responseBuilder.getResponse()
  }
}

const ErrorHandler = {
  canHandle () {
    return true
  },
  handle (handlerInput, error) {
    console.log(`Error handled: ${error.message}`)

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse()
  }
}

const skillBuilder = Alexa.SkillBuilders.custom()

exports.handler = skillBuilder
  .addRequestHandlers(
    defaultHandlers.LaunchRequestHandler,
    EmergencyIntentHandler,
    InjuryIntentHandler,
    NextIntentHandler,
    RepeatIntentHandler,
    PreviousIntentHandler,
    HelpIntentHandler,
    ThanksIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addRequestInterceptors(
    Interceptors.LocalizationInterceptor
  )
  .addErrorHandlers(ErrorHandler)
  .lambda()
