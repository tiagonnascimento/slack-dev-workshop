// Load dependencies
const { App } = require('@slack/bolt');
require('dotenv').config();
const axios = require('axios')

// Initializes your app with
// your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    appToken: process.env.SLACK_APP_TOKEN
    //, socketMode: true
});

(async () => {
    // Start your app
    await app.start(process.env.PORT || 3000);

    console.log('⚡️Hello World.. Bolt is running!');
})();

// Listen to the app_home_opened event, and when received, respond with a message including the user being messaged
app.event('app_home_opened', ({ event, say }) => {
    say(`Hello world and <@${event.user}>! Great job completing lab 1!`)
  });

// Listens to incoming messages that contain "hello"
app.message('hello', ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    say(`Hey there <@${message.user}>! You're done with lab two!`)
  });

// The echo command simply echoes on command
app.command('/survey-tnn', async ({ command, ack, payload, context, respond }) => {
    // Acknowledge command request
    ack()
  
    if (command.text === '') {
      respond({ text: 'Oops, you didn\'t provide a sub-command to your Slash command.' })
    } else {
      // Open a modal powered by Block Kit
      app.client.views.open({
        token: context.botToken,
        trigger_id: payload.trigger_id,
        view: {
          // let's save response_url so we can call it in a few moments in the view_submission action handler
          private_metadata: command.response_url,
          type: 'modal',
          callback_id: 'survey',
          title: {
            type: 'plain_text',
            text: `Survey ${command.text}`,
            emoji: true
          },
          submit: {
            type: 'plain_text',
            text: 'Submit',
            emoji: true
          },
          close: {
            type: 'plain_text',
            text: 'Cancel',
            emoji: true
          },
          blocks: [
            {
              type: 'section',
              text: {
                type: 'plain_text',
                text: ':wave: Hello!\n\nWe\'d love to hear from you how we can make this place the best place you’ve ever worked.',
                emoji: true
              }
            },
            {
              type: 'divider'
            },
            {
              block_id: 'enjoy_working',
              type: 'input',
              label: {
                type: 'plain_text',
                text: 'You enjoy working here at Acme & Co',
                emoji: true
              },
              element: {
                action_id: 'enjoy_working_action',
                type: 'static_select',
                placeholder: {
                  type: 'plain_text',
                  text: 'Select an item',
                  emoji: true
                },
                options: [
                  {
                    text: {
                      type: 'plain_text',
                      text: 'Strongly Agree',
                      emoji: true
                    },
                    value: 'strongly-agree'
                  },
                  {
                    text: {
                      type: 'plain_text',
                      text: 'Agree',
                      emoji: true
                    },
                    value: 'agree'
                  },
                  {
                    text: {
                      type: 'plain_text',
                      text: 'Neither agree nor disagree',
                      emoji: true
                    },
                    value: 'neither-agree-nor-disagree'
                  },
                  {
                    text: {
                      type: 'plain_text',
                      text: 'Disagree',
                      emoji: true
                    },
                    value: 'disagree'
                  },
                  {
                    text: {
                      type: 'plain_text',
                      text: 'Strongly disagree',
                      emoji: true
                    },
                    value: 'strongly-disgree'
                  }
                ]
              }
            },
            {
              block_id: 'lunch',
              type: 'input',
              label: {
                type: 'plain_text',
                text: 'What do you want for our team weekly lunch?',
                emoji: true
              },
              element: {
                action_id: 'lunch_action',
                type: 'multi_static_select',
                placeholder: {
                  type: 'plain_text',
                  text: 'Select your favorites',
                  emoji: true
                },
                options: [
                  {
                    text: {
                      type: 'plain_text',
                      text: ':pizza: Pizza',
                      emoji: true
                    },
                    value: 'pizza'
                  },
                  {
                    text: {
                      type: 'plain_text',
                      text: ':fried_shrimp: Thai food',
                      emoji: true
                    },
                    value: 'thai-food'
                  },
                  {
                    text: {
                      type: 'plain_text',
                      text: ':desert_island: Hawaiian',
                      emoji: true
                    },
                    value: 'hawaiian'
                  },
                  {
                    text: {
                      type: 'plain_text',
                      text: ':meat_on_bone: Texas BBQ',
                      emoji: true
                    },
                    value: 'texas-bbq'
                  },
                  {
                    text: {
                      type: 'plain_text',
                      text: ':hamburger: Burger',
                      emoji: true
                    },
                    value: 'burger'
                  },
                  {
                    text: {
                      type: 'plain_text',
                      text: ':taco: Tacos',
                      emoji: true
                    },
                    value: 'tacos'
                  },
                  {
                    text: {
                      type: 'plain_text',
                      text: ':green_salad: Salad',
                      emoji: true
                    },
                    value: 'salad'
                  },
                  {
                    text: {
                      type: 'plain_text',
                      text: ':stew: Indian',
                      emoji: true
                    },
                    value: 'indian'
                  }
                ]
              }
            },
            {
              block_id: 'anything_else',
              type: 'input',
              label: {
                type: 'plain_text',
                text: 'Anything else you want to tell us?',
                emoji: true
              },
              element: {
                action_id: 'anything_else_action',
                type: 'plain_text_input',
                multiline: true
              },
              optional: false
            }
          ]
        }
      })
    }
  })
  
  app.view('survey', async ({ ack, body, view, context }) => {
    // Acknowledge the view_submission event
    ack()
  
    // Process input
    const userResponsesRaw = view.state.values
  
    const userResponses = {
      enjoy_working: userResponsesRaw.enjoy_working.enjoy_working_action.selected_option.value,
      lunch: userResponsesRaw.lunch.lunch_action.selected_options.map((c) => { return c.text.text }),
      anything_else: userResponsesRaw.anything_else.anything_else_action.value
    }
    console.log('=== User responses ===\n', userResponses)
  
    // Send a message back to the conversation
    const message = `:wave: Thanks for filling out our survey, <@${body.user.id}>!\n:ear: We hear you loud and clear, you're interested in ${userResponses.lunch.join(' / ')} for lunch, OK!`
  
    // view.metadata has the value of our response_url webhook so that we can respond in the conversation the slash command was initiated in
    axios.post(view.private_metadata, { text: message })
  })