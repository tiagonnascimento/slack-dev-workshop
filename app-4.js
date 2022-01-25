const { App } = require('@slack/bolt')
require('dotenv').config()

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000)

  console.log('⚡️Hello World.. Bolt app is running!')
})()

// A slash command that shows an ephemeral message
app.command('/weather-tnn', async ({ command, context, ack }) => {
  ack()
  app.client.chat.postEphemeral({
    token: context.botToken,
    channel: command.channel_id,
    user: command.user_id,
    blocks: [
      {
        type: 'section',
        block_id: 'block1',
        text: {
          type: 'mrkdwn',
          text: 'Which city would you like a weather report for? :sunny::snowman_without_snow::umbrella:'
        },
        accessory: {
          type: 'external_select',
          placeholder: {
            type: 'plain_text',
            text: 'Select an item'
          },
          action_id: 'choose_city',
          min_query_length: 3
        }
      }
    ]
  })
})

// responds with options
app.options({ action_id: 'choose_city' }, async ({ ack }) => {
  // Get information specific to a team or channel
  const results = [
    { label: 'New York City', value: 'NYC' },
    { label: 'London', value: 'LON' },
    { label: 'San Francisco', value: 'SF' }
  ]

  if (results) {
    const options = []

    // Collect information in options array to send in Slack ack response
    await results.forEach(result => {
      options.push({
        text: {
          type: 'plain_text',
          text: result.label
        },
        value: result.value
      })
    })
    console.log(options)
    ack({
      options
    })
  } else {
    ack()
  }
})

// prompt weather condition based on selection
app.action('choose_city', async ({ ack, say, action }) => {
  ack()
  const selectedCity = action.selected_option.value
  if (selectedCity === 'NYC') {
    say(`You selected the option ${action.selected_option.text.text} --> "It's 80 degrees right now in New York!`)
  }
  if (selectedCity === 'LON') {
    say(`You selected the option ${action.selected_option.text.text} --> "It's 60 degrees right now in London!`)
  }
  if (selectedCity === 'SF') {
    say(`You selected the option ${action.selected_option.text.text} --> "It's 70 degrees right now in San Francisco!`)
  }
})