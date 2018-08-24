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
    const help = requestAttributes.t('initial.HELP')
    const help2 = requestAttributes.t('initial.HELP_2')
    const skillName = requestAttributes.t('initial.SKILL_NAME')

    const speechText = help + ' ' + help2

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
      const emergencyPrompt = requestAttributes.t('initial.EMERGENCY_PROMPT')
      const okay = requestAttributes.t('initial.OKAY')
      const help = requestAttributes.t('initial.HELP')
      const help2 = requestAttributes.t('initial.HELP_2')
      const disclaimer = requestAttributes.t('initial.ADVICE_DISCLAIMER')
      const callPrompt = requestAttributes.t('initial.CALL_PROMPT')
      const callConfirmed = requestAttributes.t('initial.CALL_CONFIRMED')
      const callDeclined = requestAttributes.t('initial.CALL_DECLINED')
      const injuryPrompt = requestAttributes.t('initial.INJURY_PROMPT')
      const userEnding = requestAttributes.t('initial.USER_ENDING')
      const requestName = handlerInput.requestEnvelope.request.intent.name
      sessionAttributes.speechText = ''

      if (requestName === 'EmergencyIntent') {
         //IF THE USER SAYS 'EMERGENCY' OR ANY OTHER TRIGGER WORDS, TELL THEM TO CALL 911
         sessionAttributes.speechText = callPrompt
         sessionAttributes.emergencyFlow = 1
      }
      else if (requestName === 'InjuryPromptIntent') {
         //IF THE USER SAYS 'INJURY', GIVE A DISCLAIMER, ASK WHICH INJURY THEY WOULD LIKE ADVICE ON
         sessionAttributes.speechText = disclaimer + ' ' + injuryPrompt
         //START THE INJURY ADVICE INTENT
         sessionAttributes.startAdviceIntent = 1
      }
      else if (requestName === 'YesIntent') {
         //IF THE USER HAS SAID THAT THEY NEEDED HELP AFTER COMPLETING THE ADVICE FLOW
         if (sessionAttributes.userNeedsHelp === 1) {
            sessionAttributes.speechText = help + ' ' + help2
            sessionAttributes.userNeedsHelp = 0
         }
         else if (sessionAttributes.resetFlow === 1) {
            sessionAttributes.speechText = emergencyPrompt
            sessionAttributes.resetFlow = 0

         }
         else if (sessionAttributes.injuryFlow === 1) {
            //GIVE A DISCLAIMER, ASK WHICH INJURY THEY WOULD LIKE ADVICE ON
            sessionAttributes.speechText = disclaimer + ' ' + injuryPrompt
            //START THE INJURY ADVICE INTENT
            sessionAttributes.startAdviceIntent = 1
         }
         else if (sessionAttributes.emergencyFlow === 1) {
            //IF THE USER HAS SAID THAT THEY HAVE CALLED 911
            sessionAttributes.speechText = okay + ', ' + callConfirmed
            sessionAttributes.resetFlow = 1
            sessionAttributes.emergencyFlow = 0
         }
         else {
            //IF THE USER IS IN AN EMERGENCY, TELL THEM TO CALL 911
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
            sessionAttributes.emergencyFlow = 0
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

const AdviceAndSymptomsIntentHandler = {
   canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
         (handlerInput.requestEnvelope.request.intent.name === 'NoCommandSpecifiedIntent' ||
         handlerInput.requestEnvelope.request.intent.name === 'SymptomIntent' ||
         handlerInput.requestEnvelope.request.intent.name === 'AdviceIntent' ||
         handlerInput.requestEnvelope.request.intent.name === 'YesIntent' ||
         handlerInput.requestEnvelope.request.intent.name === 'NoIntent')
   },
   handle(handlerInput) {
      const {responseBuilder, attributesManager} = handlerInput
      const requestAttributes = attributesManager.getRequestAttributes()
      const sessionAttributes = attributesManager.getSessionAttributes()
      const requestName = handlerInput.requestEnvelope.request.intent.name
      sessionAttributes.injury = handlerInput.requestEnvelope.request.intent.slots.injury
      const injury = sessionAttributes.injury
      const noCommandSpecified1 = requestAttributes.t('initial.NO_COMMAND_SPECIFIED_1')
      const noCommandSpecified2 = requestAttributes.t('initial.NO_COMMAND_SPECIFIED_2')
      const noCommandSpecified3 = requestAttributes.t('initial.NO_COMMAND_SPECIFIED_3')
      const firstStepText = requestAttributes.t('initial.FIRST_STEP_TEXT')
      const sayNext = requestAttributes.t('initial.SAY_NEXT')
      const symptomIntro = requestAttributes.t('initial.SYMPTOM_INTRO')
      const symptomPrompt = requestAttributes.t('initial.SYMPTOM_PROMPT')
      const include = requestAttributes.t('initial.INCLUDE')
      const callIfInDoubt = requestAttributes.t('initial.CALL_IF_IN_DOUBT')
      const injuryList = requestAttributes.t('initial.INJURIES')

      // IF THE USER ASKS FOR ADVICE ON AN INJURY
      if ((requestName === 'AdviceIntent') || (sessionAttributes.startAdviceIntent === 1)) {
         sessionAttributes.startAdviceIntent = 0
         sessionAttributes.injury = handlerInput.requestEnvelope.request.intent.slots.injury
         sessionAttributes.userInjury = injury.resolutions.resolutionsPerAuthority[0].values[0].value.name.toLowerCase()
         sessionAttributes.adviceIntentActive = 1

         //IF USER ASKS FOR SYMPTOMS ON A DIFFERENT INJURY, THIS WILL MAKE SURE IT STAYS ON THE SYMPTOM INTENT
         // WITHOUT THIS CODE, IT WOULD GO BACK TO GIVING THE ADVICE FOR INJURIES
         if (sessionAttributes.symptomIntentActive === 1) {
            sessionAttributes.startSymptomIntent = 1
         }
         //OTHERWISE, CARRY ON WITH THE ADVICE
         else {
            // SETTING THE USER INJURY
            const injury = sessionAttributes.injury
            if (injury && injury.value) {
               // THE CODE BELOW ALLOWS SYNONYMS TO WORK
               sessionAttributes.userInjury = injury.resolutions.resolutionsPerAuthority[0].values[0].value.name.toLowerCase()
            }

            const userInjury = sessionAttributes.userInjury

            // USERS CURRENT STEP
            sessionAttributes.counter = 0
            const counter = sessionAttributes.counter
            sessionAttributes.currentStep = injuryList[userInjury][1].stepList[counter].text
            const currentStep = sessionAttributes.currentStep

            sessionAttributes.speechText = firstStepText + ' ' + userInjury + '. ' + currentStep + ' ' + sayNext
         }
      }

      // IF SYMPTOM INTENT
      else if ((requestName === 'SymptomIntent') || (sessionAttributes.startSymptomIntent === 1)) {
         sessionAttributes.injury = handlerInput.requestEnvelope.request.intent.slots.injury
         sessionAttributes.resetFlow = 0
         sessionAttributes.startSymptomIntent = 0
         sessionAttributes.symptomIntentActive = 1
         sessionAttributes.injury = handlerInput.requestEnvelope.request.intent.slots.injury
         const injury = sessionAttributes.injury
         attributesManager.setSessionAttributes(sessionAttributes)

         // IF THERE IS NO USER CHOICE, PROMPT THE USER
         if (sessionAttributes.userInjury === undefined) {
            if (injury && injury.value) {
               sessionAttributes.userInjury = injury.resolutions.resolutionsPerAuthority[0].values[0].value.name.toLowerCase()
               attributesManager.setSessionAttributes(sessionAttributes)

               //ACTUAL SYMPTOM FLOW
               sessionAttributes.symptom = injuryList[sessionAttributes.userInjury][0].symptoms
               const symptom = sessionAttributes.symptom

               console.log('hi' + sessionAttributes.userInjury)

               if (sessionAttributes.userInjury === ('bleeding' || 'animal bite' || 'burns')) {
                  sessionAttributes.speechText = symptom + ' ' + callIfInDoubt
               }
               else {
                  sessionAttributes.speechText = symptomIntro + ' ' + sessionAttributes.userInjury + ' ' + include + ' ' + symptom + ' ' + callIfInDoubt
               }
               sessionAttributes.symptomIntentActive = 0
            }
            else {
               sessionAttributes.speechText = symptomPrompt
               sessionAttributes.startSymptomIntent = 1
            }
         }
         else {
            //ACTUAL SYMPTOM FLOW
            sessionAttributes.newUserChoice = injury.resolutions.resolutionsPerAuthority[0].values[0].value.name.toLowerCase()
            if (!(sessionAttributes.userInjury === sessionAttributes.newUserChoice)) {
               sessionAttributes.userInjury = sessionAttributes.newUserChoice
               attributesManager.setSessionAttributes(sessionAttributes)
            }

            sessionAttributes.symptom = injuryList[sessionAttributes.userInjury][0].symptoms
            const symptom = sessionAttributes.symptom

            console.log('hi' + sessionAttributes.newUserChoice)
            console.log('hi' + sessionAttributes.userInjury)

            if (sessionAttributes.userInjury === ('bleeding' || 'animal bite' || 'burns')) {
               sessionAttributes.speechText = symptom + ' ' + callIfInDoubt
            }
            else {
               sessionAttributes.speechText = symptomIntro + ' ' + sessionAttributes.userInjury + ' ' + include + ' ' + symptom + ' ' + callIfInDoubt
            }
            sessionAttributes.symptomIntentActive = 0                                                                                                      
         }
      }

      // IF USER JUST SAYS AN INJURY WITHOUT ASKING FOR ADVICE OR SYMPTOMS
      else if (requestName === 'NoCommandSpecifiedIntent') {
         if (sessionAttributes.chosenInjury === 1) {
            //SET THIS TO THE USER'S INJURY
            sessionAttributes.userInjury = injury.resolutions.resolutionsPerAuthority[0].values[0].value.name.toLowerCase()
            //START THE INJURY ADVICE INTENT
            sessionAttributes.startAdviceIntent = 1
         }
         //OTHERWISE, ASK THE USER TO SPECIFY WHETHER THEY WANT ADVICE OR SYMPTOMS
         else {
            sessionAttributes.speechText = noCommandSpecified1 + ' ' + injury.value + '\" ' + noCommandSpecified2 + ' \"' + injury.value + ' ' + noCommandSpecified3
         }
      }

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
      const noOfSteps = ((Object.keys(injuryList[userInjury][1].stepList).length) - 1)
      sessionAttributes.counter += 1
      const counter = sessionAttributes.counter
      sessionAttributes.currentStep = injuryList[userInjury][1].stepList[counter].text
      const currentStep = sessionAttributes.currentStep
      sessionAttributes.resetFlow = 0

      if (counter === noOfSteps) {
        sessionAttributes.speechText = finalStepText + ' ' + currentStep + ' ' + repeatPrompt + ' ' + helpPrompt
        sessionAttributes.resetFlow = 1
         sessionAttributes.adviceIntentActive = 0
         sessionAttributes.userInjury = undefined
         sessionAttributes.userNeedsHelp = 1
        sessionAttributes.emergencyFlow = 0
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
      const noOfSteps = ((Object.keys(injuryList[userInjury][1].stepList).length) - 1)
      const counter = sessionAttributes.counter
      sessionAttributes.currentStep = injuryList[userInjury][1].stepList[counter].text
      const currentStep = sessionAttributes.currentStep
      sessionAttributes.resetFlow = 0

      if (counter === noOfSteps) {
        sessionAttributes.speechText = currentStep + ' ' + repeatPrompt + ' ' + helpPrompt
        sessionAttributes.resetFlow = 1
         sessionAttributes.adviceIntentActive = 0
         sessionAttributes.userInjury = undefined
         sessionAttributes.userNeedsHelp = 1
         sessionAttributes.emergencyFlow = 0
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
      const noOfSteps = ((Object.keys(injuryList[userInjury][1].stepList).length) - 1)
      sessionAttributes.counter -= 1
      const counter = sessionAttributes.counter
      sessionAttributes.currentStep = injuryList[userInjury][1].stepList[counter].text
      const currentStep = sessionAttributes.currentStep
      sessionAttributes.resetFlow = 0

      if (counter === noOfSteps) {
        sessionAttributes.speechText = currentStep + ' ' + repeatPrompt + ' ' + helpPrompt
        sessionAttributes.resetFlow = 1
         sessionAttributes.adviceIntentActive = 0
         sessionAttributes.userInjury = undefined
         sessionAttributes.userNeedsHelp = 1
         sessionAttributes.emergencyFlow = 0
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
    AdviceAndSymptomsIntentHandler,
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
