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
    const speechText = requestAttributes.t('initial.HELP')
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
      const requestAttributes = attributesManager.getRequestAttributes()
      const injuryQuestion = requestAttributes.t('initial.INJURY_QUESTION')
      const options = requestAttributes.t('initial.OPTIONS')
      const okay = requestAttributes.t('initial.OKAY')
      const callPrompt = requestAttributes.t('initial.CALL_PROMPT')
      const helpPrompt = requestAttributes.t('initial.HELP_PROMPT')
      const callConfirmed = requestAttributes.t('initial.CALL_CONFIRMED')
      const callDeclined = requestAttributes.t('initial.CALL_DECLINED')
      const injuryPrompt = requestAttributes.t('initial.INJURY_PROMPT')
      const userEnding = requestAttributes.t('initial.USER_ENDING')
      const requestName = handlerInput.requestEnvelope.request.intent.name
      sessionAttributes.speechText = ''

      if (requestName === 'EmergencyIntent') {
         sessionAttributes.speechText = callPrompt
         sessionAttributes.emergencyFlow = 1
      }
      else if (requestName === 'InjuryPromptIntent') {
         sessionAttributes.speechText = okay + ', ' + injuryPrompt
      }
      else if (requestName === 'YesIntent') {
         if (sessionAttributes.resetFlow === 1) {
            sessionAttributes.speechText = options
            sessionAttributes.resetFlow = 0
         }
         else if (sessionAttributes.injuryFlow === 1) {
            sessionAttributes.speechText = okay + ', ' + injuryPrompt
         }
         else if (sessionAttributes.emergencyFlow === 1) {
            sessionAttributes.speechText = okay + ', ' + callConfirmed
         }
         else {
            sessionAttributes.speechText = callPrompt
            sessionAttributes.emergencyFlow = 1
         }
      }
      else if (requestName === 'NoIntent') {
         if (sessionAttributes.resetFlow === 1) {
            sessionAttributes.speechText = okay + ', ' + userEnding
            return handlerInput.responseBuilder
               .speak(sessionAttributes.speechText)
               .withShouldEndSession(true)
               .getResponse()
         }
         else if (sessionAttributes.emergencyFlow === 1) {
            sessionAttributes.speechText = callDeclined
            sessionAttributes.resetFlow = 1
         }
         else {
            sessionAttributes.speechText = injuryQuestion
            sessionAttributes.injuryFlow = 1
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
      const firstStepText = requestAttributes.t('initial.FIRST_STEP_TEXT')
      const sayNext = requestAttributes.t('initial.SAY_NEXT')
      sessionAttributes.injury = handlerInput.requestEnvelope.request.intent.slots.injury
      const injuryList = requestAttributes.t('initial.INJURIES')

      // the user's injury
      const injury = sessionAttributes.injury
      if (injury && injury.value) {
         // the code below allows the synonyms to work
         sessionAttributes.userInjury = injury.resolutions.resolutionsPerAuthority[0].values[0].value.name.toLowerCase()
      }

      const userInjury = sessionAttributes.userInjury

      // the user's current step
      sessionAttributes.counter = 0
      const counter = sessionAttributes.counter
      sessionAttributes.currentStep = injuryList[userInjury][counter].text
      const currentStep = sessionAttributes.currentStep

      sessionAttributes.speechText = disclaimer + ' ' + firstStepText + ' ' + currentStep + ' ' + sayNext

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
      const finalStepText = requestAttributes.t('initial.FINAL_STEP_TEXT')
      const repeatPrompt = requestAttributes.t('initial.REPEAT_PROMPT')
      const helpPrompt = requestAttributes.t('initial.HELP_PROMPT')
      const userInjury = sessionAttributes.userInjury
      const noOfSteps = ((Object.keys(injuryList[userInjury]).length) - 1)
      sessionAttributes.counter += 1
      const counter = sessionAttributes.counter
      sessionAttributes.currentStep = injuryList[userInjury][counter].text
      const currentStep = sessionAttributes.currentStep
      sessionAttributes.resetFlow = 0

      if (counter === noOfSteps) {
        sessionAttributes.speechText = finalStepText + ' ' + currentStep + ' ' + repeatPrompt + ' ' + helpPrompt
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
      const repeatPrompt = requestAttributes.t('initial.REPEAT_PROMPT')
      const helpPrompt = requestAttributes.t('initial.HELP_PROMPT')
      const userInjury = sessionAttributes.userInjury
      const noOfSteps = ((Object.keys(injuryList[userInjury]).length) - 1)
      const counter = sessionAttributes.counter
      sessionAttributes.currentStep = injuryList[userInjury][counter].text
      const currentStep = sessionAttributes.currentStep
      sessionAttributes.resetFlow = 0

      if (counter === noOfSteps) {
        sessionAttributes.speechText = currentStep + ' ' + repeatPrompt + ' ' + helpPrompt
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
      const repeatPrompt = requestAttributes.t('initial.REPEAT_PROMPT')
      const helpPrompt = requestAttributes.t('initial.HELP_PROMPT')
      const userInjury = sessionAttributes.userInjury
      const noOfSteps = ((Object.keys(injuryList[userInjury]).length) - 1)
      sessionAttributes.counter -= 1
      const counter = sessionAttributes.counter
      sessionAttributes.currentStep = injuryList[userInjury][counter].text
      const currentStep = sessionAttributes.currentStep
      sessionAttributes.resetFlow = 0

      if (counter === noOfSteps) {
        sessionAttributes.speechText = currentStep + ' ' + repeatPrompt + ' ' + helpPrompt
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
    const okay = requestAttributes.t('initial.OKAY')
    const userEnding = requestAttributes.t('initial.USER_ENDING')

     sessionAttributes.speechText = okay + ', ' + userEnding
     return responseBuilder
        .speak(sessionAttributes.speechText)
        .withShouldEndSession(true)
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
