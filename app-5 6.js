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

// Custom unfurls
app.event('link_shared', async ({ event, context }) => {
  console.log('got a link share event')
  const unfurls = {}
  event.links.forEach(async (link) => {
    // let customText = `:wave: This is a custom unfurl of *url*=${link.url} *domain*=${link.domain}`;
    const unfurlBlocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'This is a custom unfurl, made possible by calling the Slack `chat.unfurl` API'
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Domain:*\n${link.domain}`
          },
          {
            type: 'mrkdwn',
            text: `*URL:*\n${link.url}`
          }
        ]
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Was this unfurl helpful?'
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              emoji: true,
              text: 'Yes :100: '
            },
            style: 'primary',
            value: 'yes_helpful'
          },
          {
            type: 'button',
            text: {
              type: 'plain_text',
              emoji: true,
              text: 'Needs work :thumbsdown:'
            },
            style: 'danger',
            value: 'no_needs_work'
          }
        ]
      }
    ]
    unfurls[link.url] = { blocks: unfurlBlocks }
  })
  app.client.chat.unfurl({
    token: process.env.SLACK_BOT_TOKEN,
    channel: event.channel,
    ts: event.message_ts,
    unfurls: unfurls
  })
})

// Waiting for the save4later message action to be called, which will retrieve a message link
// and post to the user who initiated's app home
app.shortcut('save4later-tnn', async ({ shortcut, ack, say, respond, context }) => {
    ack()
  
    try {
      const resultLink = await app.client.chat.getPermalink({
        token: context.botToken,
        channel: shortcut.channel.id,
        message_ts: shortcut.message_ts
      })
  
      var theMessage = `:wave: Hi there! remember when you thought you'd enjoy this interesting message ${resultLink.permalink}? Thank yourself for this!!`
  
      // Try block for second web api call to post link to the message
      try {
        await app.client.chat.postMessage({
          // The token you used to initialize your app is stored in the `context` object
          // Sending the channel id as the user will send to the user
          token: context.botToken,
          channel: shortcut.user.id,
          as_user: true,
          text: theMessage
        })
        console.log(`Remember request sent to ${shortcut.user.id}`)
      } catch (postMessageFailure) {
        console.error(postMessageFailure)
      }
    } catch (permaLinkFailure) {
      console.error(permaLinkFailure)
    }
  })