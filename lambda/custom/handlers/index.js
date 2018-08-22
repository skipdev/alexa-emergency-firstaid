module.exports = () => {
  return {
    getDefaultHandlers: () => {
      return {
        LaunchRequestHandler: {
          canHandle (handlerInput) {
            return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
          },
          handle (handlerInput) {
            const { responseBuilder, attributesManager } = handlerInput
            const requestAttributes = attributesManager.getRequestAttributes()
            const sessionAttributes = attributesManager.getSessionAttributes()
            const skillName = requestAttributes.t('initial.SKILL_NAME')
            const emergencyPrompt = requestAttributes.t('initial.EMERGENCY_PROMPT')
            const welcomeMessage = requestAttributes.t('initial.HELLO', {skillName})

            sessionAttributes.speechText = welcomeMessage + ' ' + emergencyPrompt
            const repromptText = emergencyPrompt

            return responseBuilder
              .speak(sessionAttributes.speechText)
              .reprompt(repromptText)
              .getResponse()
          }
        }
      }
    }
  }
}
