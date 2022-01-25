const { App } = require('@slack/bolt')
require('dotenv').config()

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000)


  console.log('⚡️ Hello World.. Bolt app is running!')

  // Wait 5 seconds before running once. Generally an unconventional mechanism to execute based on time. For lab/illustrative purposes only!
  setTimeout(requestBirthday, 5000)
})()


async function requestBirthday () {
  console.log('Begin birthday post to channel creator in: ' + process.env.SLACK_BIRTHDAYS_CHANNEL)

  try {
    var channelResult = await app.client.conversations.info({ token: process.env.SLACK_USER_TOKEN, channel: process.env.SLACK_BIRTHDAYS_CHANNEL })
    var channelCreator = channelResult.channel.creator

    try {
      app.client.chat.postEphemeral({
        token: process.env.SLACK_USER_TOKEN,
        channel: process.env.SLACK_BIRTHDAYS_CHANNEL,
        user: channelCreator,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'When is your birthday, channel creator?'
            },
            accessory: {
              type: 'datepicker',
              action_id: 'mybirthday',
              initial_date: '1999-12-31',
              confirm: {
                title: {
                  type: 'plain_text',
                  text: 'Are you sure this is your birthday?'
                },
                confirm: {
                  type: 'plain_text',
                  text: 'Yep!'
                },
                deny: {
                  type: 'plain_text',
                  text: 'Sorry, my bad!'
                }
              },
              placeholder: {
                type: 'plain_text',
                text: 'Select a date'
              }
            }
          }
        ]
      })
    } catch (postMessageFailure) {
      console.error(postMessageFailure)
    }
  } catch (channelInfoError) {
    console.error('Channel error: ' + channelInfoError)
  }
}

// Listening for the 'mybirthday' block/date field we sent above...
app.action('mybirthday', async ({ action, ack, respond }) => {
  ack()
  var birthday = new Date(action.selected_date)
  var currentDate = new Date()
  var dayAge = Math.ceil(Math.abs(currentDate.getTime() - birthday.getTime()) / (1000 * 3600 * 24)).toString()
  console.log('Birthday Received : ' + birthday.toDateString())
  var respondText = "Wow, cool ... you're " + dayAge + ' days old!'
  respond({ text: respondText, delete_original: true })
  // Given an unconventional execution mechanism, go ahead and stop the app execution now
  app.stop()
})