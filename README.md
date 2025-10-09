# slitherwither
Group personality test engine

## Features
- Simple text-based test creation
- URL-based sharing (no database needed)
- Instant results with visualizations

## Create a test

Visit `/create.html` and define your test:

\`\`\`
dimension introversion
  range -10 to 10

question
  text "I prefer working alone"
  scale 1 to 5
  scoring
    introversion +1
\`\`\`

Click "Create Share Link" and send to friends!

## Tech Stack
- Vanilla JavaScript
- Zero dependencies
- Client-side only
- Free hosting on Vercel
