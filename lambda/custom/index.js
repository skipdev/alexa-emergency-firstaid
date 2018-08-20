const Alexa = require('ask-sdk-core')
const Interceptors = require('./interceptors')()
const Handlers = require('./handlers')()
const defaultHandlers = Handlers.getDefaultHandlers()
const quizHandlers = Handlers.getQuizHandlers()

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

const EmergencyIntentHandler = {
   canHandle (handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
         (handlerInput.requestEnvelope.request.intent.name === 'YesIntent' ||
            handlerInput.requestEnvelope.request.intent.name === 'NoIntent')
   },
   handle (handlerInput) {
      const { responseBuilder, attributesManager} = handlerInput
      const sessionAttributes = attributesManager.getSessionAttributes()
      const requestName = handlerInput.requestEnvelope.request.intent.name
      sessionAttributes.speechText = ''

      if (sessionAttributes.end === 1) {
         if (requestName === 'YesIntent') {
            sessionAttributes.speechText = 'Okay, calling now.'
         } else if (requestName === 'NoIntent') {
            sessionAttributes.speechText = 'Okay, I won\'t call them.'
         }
      }
      else {
         if (requestName === 'YesIntent') {
            sessionAttributes.speechText = 'Should I call 911?'
         }
         else if (requestName === 'NoIntent') {
            sessionAttributes.speechText = 'Would you like advice on an injury?'
         }
         sessionAttributes.end = 1
      }
      attributesManager.setSessionAttributes(sessionAttributes)
      return responseBuilder
         .speak(sessionAttributes.speechText)
         .reprompt(sessionAttributes.speechText)
         .getResponse()
   }
}

const TestIntentHandler = {
   canHandle (handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
         (handlerInput.requestEnvelope.request.intent.name === 'TestIntent')
   },
   handle (handlerInput) {
      const { responseBuilder } = handlerInput
      let speechText = 'test'
      return responseBuilder
         .speak(speechText)
         .getResponse()
   }
}

const NextIntentHandler = {
   canHandle (handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
         (handlerInput.requestEnvelope.request.intent.name === 'NextIntent')
   },
   handle (handlerInput) {
      const { responseBuilder } = handlerInput
      let speechText = 'you said next'
      return responseBuilder
         .speak(speechText)
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

      if (scoreNumber === questionTotal) {
        speechText = requestAttributes.t('initial.ALL_ANSWERS_CORRECT') + ' ' + byeMessages[byeNumber] + '!'
      } else {
        speechText = `${requestAttributes.t('initial.NO_MESSAGE', { score: scoreNumber, questionNumber: questionTotal })}` + ' ' + byeMessages[byeNumber] + '!'
      }
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
    quizHandlers.StartQuiz,
    quizHandlers.AnswerHandler,
    EmergencyIntentHandler,
    NextIntentHandler,
    TestIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addRequestInterceptors(
    Interceptors.LocalizationInterceptor
  )
  .addErrorHandlers(ErrorHandler)
  .lambda()
