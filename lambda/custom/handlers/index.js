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
            let skillName = requestAttributes.t('initial.SKILL_NAME')
            const speechText = requestAttributes.t('initial.HELLO', {skillName})
            const repromptText = requestAttributes.t('initial.OPTIONS')

            return responseBuilder
              .speak(speechText)
              .reprompt(repromptText)
              .getResponse()
          }
        }
      }
    }
  }
}
