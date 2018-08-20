const i18n = require('i18next')
const sprintf = require('i18next-sprintf-postprocessor')

const languageStrings = require('../content')

const Helpers = require('../helpers')

module.exports = () => {
  return {
    /*
     * Create a localization interceptor.
     * Adds a translate function (t(...)) to a handler's attributes
     * Adds a helpers function to a handler's attributes
     */
    LocalizationInterceptor: {
      process (handlerInput) {
        const localizationClient = i18n.use(sprintf).init({
          lng: handlerInput.requestEnvelope.request.locale || 'en-US',
          overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
          resources: languageStrings.strings,
          returnObjects: true
        })

        const attributes = handlerInput.attributesManager.getRequestAttributes()
        attributes.t = function (...args) {
          return localizationClient.t(...args)
        }
        attributes.helpers = new Helpers()
      }
    }
  }
}
