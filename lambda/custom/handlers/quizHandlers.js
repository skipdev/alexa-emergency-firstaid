const topics = require('../helpers/topics')

module.exports = () => {
  return {
    StartQuiz: {
      canHandle (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
          handlerInput.requestEnvelope.request.intent.name === 'StartQuiz'
      },
      handle (handlerInput) {
        const { responseBuilder, attributesManager } = handlerInput
        const requestAttributes = attributesManager.getRequestAttributes()
        const sessionAttributes = attributesManager.getSessionAttributes()
        const topicSlot = handlerInput.requestEnvelope.request.intent.slots.injury

        sessionAttributes.answeredQuestions = []
        // If we haven't started the quiz yet
        if (sessionAttributes.counter === undefined) {
          // Speech declarations
          const noTopic = 'hi'
          const noTopicReprompt = 'do again'

          let topicName = ''

          if (topicSlot && topicSlot.value) {
            topicName = topicSlot.value.toLowerCase()
          }

          sessionAttributes.quizTopic = null

          // Validation for topic name
          switch (topicName) {
            case topics.BLEEDING:
              sessionAttributes.quizTopic = topics.BLEEDING
              break
            case topics.BURNS:
              sessionAttributes.quizTopic = topics.BURNS
              break
            case topics.BROKEN_BONES:
              sessionAttributes.quizTopic = topics.BROKEN_BONES
              break
            case topics.CHOKING:
              sessionAttributes.quizTopic = topics.CHOKING
              break
          }

          // If no valid topic, ask the user again what they would like to do
          if (!sessionAttributes.quizTopic) {
            return responseBuilder
              .speak(noTopic)
              .reprompt(noTopicReprompt)
              .getResponse()
          }
          sessionAttributes.counter = 0
        } // End if - haven't started quiz

        const questions = requestAttributes.t('initial.INJURIES')
        const questionType = sessionAttributes.quizTopic
        let counter = sessionAttributes.counter
        const firstQuestion = 'intro question: '
        const noOfQuestionsInTopic = Object.keys(questions[questionType]).length
        sessionAttributes.randomQuestion = requestAttributes.helpers.getRandom(noOfQuestionsInTopic)
        const randomQuestion = sessionAttributes.randomQuestion
        let speechText = ''

        speechText = questions[questionType][randomQuestion].question
        sessionAttributes.correctAnswerAdvice = questions[questionType][randomQuestion].advice
        sessionAttributes.correctAnswer = questions[questionType][randomQuestion].correctAnswer
        sessionAttributes.speechOutput = questions[questionType][randomQuestion].question
        sessionAttributes.quizLength = 4

        // For the first question, put an introduction
        if (counter === 0) {
          speechText = firstQuestion + ' ' + questions[questionType][randomQuestion].question
        } else {
          speechText = questions[questionType][randomQuestion].question
        }
        sessionAttributes.answeredQuestions.push(questions[questionType][randomQuestion].question)

        sessionAttributes.counter += 1

        if (sessionAttributes.score === undefined) {
          sessionAttributes.score = 0
        }
        if (sessionAttributes.counter === undefined) {
          sessionAttributes.counter = 0
        }
        if (sessionAttributes.randomQuestion === undefined) {
          sessionAttributes.randomQuestion = 0
        }

        return responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .getResponse()
      } // End handle(handlerInput)
    }, // End StartQuiz handler

    AnswerHandler: {
      canHandle (handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
             (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent' ||
               handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent')
      },
      async handle (handlerInput) {
        const attributesManager = handlerInput.attributesManager
        const responseBuilder = handlerInput.responseBuilder
        const requestAttributes = attributesManager.getRequestAttributes()
        const sessionAttributes = attributesManager.getSessionAttributes()
        const requestName = handlerInput.requestEnvelope.request.intent.name
        const questions = requestAttributes.t('initial.INJURIES')
        const endMsg = 'end'
        const restartMsg = 'restart'
        const restartOptions = 'options'
        const thanks = requestAttributes.t('initial.THANKS')
        const yesSpeech = requestAttributes.t('initial.YES')
        const noSpeech = requestAttributes.t('initial.NO')
        const okay = requestAttributes.t('initial.OKAY')
        const outOf = 'out of'
        const nextQuestionSpeech = 'next q: '
        const questionType = sessionAttributes.quizTopic

        // Remove already answered questions
        if (sessionAttributes.answeredQuestions) {
          sessionAttributes.answeredQuestions.forEach((questionText) => {
            const indexToRemove = questions[questionType].findIndex(question => question.question === questionText)
            if (indexToRemove > -1) {
              questions[questionType].splice(indexToRemove, 1)
            }
          })
        }

        console.log(JSON.stringify(questions[questionType]))

        const correctAnswer = sessionAttributes.correctAnswer
        const advice = sessionAttributes.correctAnswerAdvice
        let score = sessionAttributes.score
        let counter = sessionAttributes.counter
        const gameOver = sessionAttributes.quizLength
        let speechOutput = ''
        const noOfQuestionsInTopic = Object.keys(questions[questionType]).length
        sessionAttributes.randomQuestion = requestAttributes.helpers.getRandom(noOfQuestionsInTopic)

        console.log(JSON.stringify(sessionAttributes))
        console.log('Number of questions', noOfQuestionsInTopic)
        console.log('Random Question Index', sessionAttributes.randomQuestion)

        const randomQuestion = sessionAttributes.randomQuestion
        const nextQuestion = questions[questionType][randomQuestion].question

        console.log('Next Question', nextQuestion)

        const correctPhrases = 'yay'
        const incorrectPhrases = 'oopsy'

        const userCorrect = correctPhrases[requestAttributes.helpers.getRandom(correctPhrases.length)] + '! '
        const userIncorrect = incorrectPhrases[requestAttributes.helpers.getRandom(incorrectPhrases.length)] + '! '

        sessionAttributes.correctAnswerAdvice = questions[questionType][randomQuestion].advice
        sessionAttributes.correctAnswer = questions[questionType][randomQuestion].correctAnswer

        // if the user has finished the quiz, either restart or quit
        if (sessionAttributes.refreshGame === 1) {
          if (requestName === 'AMAZON.YesIntent') {
            sessionAttributes.score = 0
            sessionAttributes.counter = undefined
            sessionAttributes.refreshGame = 0
            sessionAttributes.answeredQuestions = []
            speechOutput = okay + '. ' + restartOptions
          }
          if (requestName === 'AMAZON.NoIntent') {
            return handlerInput.responseBuilder
              .speak(thanks)
              .withShouldEndSession(true)
              .getResponse()
          }
        } else {
          // if the user is on the last question, do this
          if (counter >= gameOver) {
            if (requestName === 'AMAZON.YesIntent') {
              if (correctAnswer.toLowerCase() === yesSpeech) {
                // user answer = 'yes', correct answer = 'yes'
                speechOutput = userCorrect + advice + ' ' + endMsg + (score + 1) + ' ' + outOf + ' ' + gameOver + '. ' + restartMsg
              } else if (correctAnswer.toLowerCase() === noSpeech) {
                // user answer = 'yes', correct answer = 'no'
                speechOutput = userIncorrect + advice + ' ' + endMsg + score + ' ' + outOf + ' ' + gameOver + '. ' + restartMsg
              }
            } else if (requestName === 'AMAZON.NoIntent') {
              if (correctAnswer.toLowerCase() === yesSpeech) {
                // user answer = 'no', correct answer = 'yes'
                speechOutput = userIncorrect + advice + ' ' + endMsg + score + ' ' + outOf + ' ' + gameOver + '. ' + restartMsg
              } else if (correctAnswer.toLowerCase() === noSpeech) {
                // user answer = 'no', correct answer = 'no'
                speechOutput = userCorrect + advice + ' ' + endMsg + (score + 1) + ' ' + outOf + ' ' + gameOver + '. ' + restartMsg
              }
            }
            sessionAttributes.counter = 0
            sessionAttributes.refreshGame = 1
          } else {
            if (requestName === 'AMAZON.YesIntent') {
              if (correctAnswer.toLowerCase() === yesSpeech) {
                // user answer = 'yes', correct answer = 'yes'
                sessionAttributes.score += 1
                speechOutput = userCorrect + advice + ' ' + nextQuestionSpeech + ': ' + nextQuestion
              } else if (correctAnswer.toLowerCase() === noSpeech) {
                // user answer = 'yes', correct answer = 'no'
                speechOutput = userIncorrect + advice + ' ' + nextQuestionSpeech + ': ' + nextQuestion
              }
            } else if (requestName === 'AMAZON.NoIntent') {
              if (correctAnswer.toLowerCase() === yesSpeech) {
                // user answer = 'no', correct answer = 'yes'
                speechOutput = userIncorrect + advice + ' ' + nextQuestionSpeech + ': ' + nextQuestion
              } else if (correctAnswer.toLowerCase() === noSpeech) {
                // user answer = 'no', correct answer = 'no'
                sessionAttributes.score += 1
                speechOutput = userCorrect + advice + ' ' + nextQuestionSpeech + ': ' + nextQuestion
              }
            } // end noIntent
            sessionAttributes.counter += 1
          } // end else
          sessionAttributes.answeredQuestions.push(questions[questionType][randomQuestion].question)
        } // end overall quiz flow
        attributesManager.setSessionAttributes(sessionAttributes)

        return responseBuilder
          .speak(speechOutput)
          .reprompt(speechOutput)
          .getResponse()
      }
    }
  }
}
