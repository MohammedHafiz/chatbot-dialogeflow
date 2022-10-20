const config = require('../config/devkey')
const dialogflow = require('dialogflow') 

const projectId = config.googleProjectId
const sessionId = config.dialogFlowSessionId

const credentials = {
    client_email: config.googleclientEmail,
    private_key: config.googlePrivateKey
}

const sessionClient = new dialogflow.SessionsClient({projectId, credentials});



const textQuery = async (userText, userId) => {

    const sessionPath = sessionClient.sessionPath(projectId, sessionId + userId);
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: userText,
                languageCode: config.dialogFlowSessionLanguageCode
            }
        }

    }
    try {
        const response = await sessionClient.detectIntent(request)
        return response[0].queryResult
    } catch (err) {
        console.log("err",err)
    }

}

module.exports = {textQuery}