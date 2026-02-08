// examples.js - Built-in test examples for the editor
const examples = {
  mbti: `dimension introversion
  range -10 to 10

dimension thinking
  range -10 to 10

dimension judging
  range -10 to 10

dimension sensing
  range -10 to 10

question
  text "I prefer spending time alone to recharge"
  scale 1 to 5
  scoring
    introversion +1

question
  text "I enjoy meeting new people at social events"
  scale 1 to 5
  scoring
    introversion -1

question
  text "I make decisions based on logic rather than feelings"
  scale 1 to 5
  scoring
    thinking +1

question
  text "I consider how my decisions affect others emotionally"
  scale 1 to 5
  scoring
    thinking -1

question
  text "I like to have things planned and organized"
  scale 1 to 5
  scoring
    judging +1

question
  text "I prefer to keep my options open and be spontaneous"
  scale 1 to 5
  scoring
    judging -1

question
  text "I focus on concrete facts and details"
  scale 1 to 5
  scoring
    sensing +1

question
  text "I enjoy exploring abstract ideas and possibilities"
  scale 1 to 5
  scoring
    sensing -1

interpretation
  if introversion > 3
  if thinking > 3
    You're an INTJ - The Architect: Strategic, logical, and independent. You excel at long-term planning and systems thinking.

interpretation
  if introversion > 3
  if thinking < -3
    You're an INFJ - The Advocate: Insightful, principled, and empathetic. You seek meaning and connection in everything.

interpretation
  if introversion < -3
  if thinking > 3
    You're an ENTJ - The Commander: Bold, decisive, and strategic. You're a natural leader who sees the big picture.

interpretation
  if introversion < -3
  if thinking < -3
    You're an ENFJ - The Protagonist: Charismatic, inspiring, and empathetic. You naturally bring out the best in others.`,

  team: `dimension leadership
  range -10 to 10

dimension creativity
  range -10 to 10

dimension detail_oriented
  range -10 to 10

dimension collaborative
  range -10 to 10

question
  text "I enjoy taking charge of projects and making key decisions"
  scale 1 to 5
  scoring
    leadership +1

question
  text "I prefer following someone else's lead rather than directing"
  scale 1 to 5
  scoring
    leadership -1

question
  text "I love brainstorming new ideas and innovative solutions"
  scale 1 to 5
  scoring
    creativity +1

question
  text "I prefer refining existing ideas rather than creating new ones"
  scale 1 to 5
  scoring
    creativity -1

question
  text "I notice small details that others might miss"
  scale 1 to 5
  scoring
    detail_oriented +1

question
  text "I focus on the big picture and overall strategy"
  scale 1 to 5
  scoring
    detail_oriented -1

question
  text "I work best when collaborating closely with others"
  scale 1 to 5
  scoring
    collaborative +1

question
  text "I'm most productive working independently"
  scale 1 to 5
  scoring
    collaborative -1

interpretation
  if leadership > 3
  if creativity > 3
    You're an Innovator: You lead with vision and creativity, inspiring teams to think differently and embrace change.

interpretation
  if leadership > 3
  if detail_oriented > 3
    You're a Coordinator: You organize teams and ensure quality, bringing structure to complex projects.

interpretation
  if creativity > 3
  if collaborative > 3
    You're a Creator: You thrive in collaborative brainstorming, building on others' ideas to create something new.

interpretation
  if detail_oriented > 3
  if collaborative > 3
    You're a Specialist: You excel at careful execution and quality assurance, making sure nothing falls through the cracks.

interpretation
  if leadership < -3
  if collaborative > 3
    You're a Supporter: You enable others to succeed, providing crucial assistance and maintaining team harmony.`,

  learning: `dimension visual
  range -10 to 10

dimension analytical
  range -10 to 10

dimension practical
  range -10 to 10

question
  text "I learn best from diagrams, charts, and visual aids"
  scale 1 to 5
  scoring
    visual +1

question
  text "I prefer reading text explanations over looking at pictures"
  scale 1 to 5
  scoring
    visual -1

question
  text "I like to understand why something works before learning how"
  scale 1 to 5
  scoring
    analytical +1

question
  text "I prefer jumping in and learning by doing"
  scale 1 to 5
  scoring
    practical +1

question
  text "I take detailed notes and create outlines when studying"
  scale 1 to 5
  scoring
    analytical +1

question
  text "I remember things better when I practice them hands-on"
  scale 1 to 5
  scoring
    practical +1

question
  text "I can visualize concepts easily in my mind"
  scale 1 to 5
  scoring
    visual +1

question
  text "I need to see real-world applications to stay engaged"
  scale 1 to 5
  scoring
    practical +1

interpretation
  if visual > 3
  if analytical > 3
    You're a Visual Analyst: You excel at understanding complex systems through diagrams and structured thinking.

interpretation
  if visual > 3
  if practical > 3
    You're a Visual Practitioner: You learn best by seeing demonstrations and then practicing the technique yourself.

interpretation
  if analytical > 3
  if practical < -3
    You're a Theoretical Thinker: You love understanding deep principles and building mental models before application.

interpretation
  if practical > 3
    You're a Hands-On Learner: You learn by doing, experimenting, and getting immediate feedback from real experiences.`,

  hogwarts: `dimension bravery
  range -10 to 10

dimension intelligence
  range -10 to 10

dimension ambition
  range -10 to 10

dimension loyalty
  range -10 to 10

question
  text "I stand up for what I believe in, even when it's difficult"
  scale 1 to 5
  scoring
    bravery +1

question
  text "I prefer to think before I act"
  scale 1 to 5
  scoring
    intelligence +1

question
  text "I am driven to succeed and achieve my goals"
  scale 1 to 5
  scoring
    ambition +1

question
  text "I value loyalty and friendship above all else"
  scale 1 to 5
  scoring
    loyalty +1

question
  text "I enjoy taking risks and seeking adventure"
  scale 1 to 5
  scoring
    bravery +1

question
  text "I enjoy solving complex problems"
  scale 1 to 5
  scoring
    intelligence +1

question
  text "I am competitive and like to win"
  scale 1 to 5
  scoring
    ambition +1

question
  text "I will always support my friends"
  scale 1 to 5
  scoring
    loyalty +1

character "Gryffindor"
  bravery 8
  intelligence 5
  ambition 5
  loyalty 7

character "Ravenclaw"
  bravery 4
  intelligence 9
  ambition 6
  loyalty 5

character "Slytherin"
  bravery 5
  intelligence 7
  ambition 9
  loyalty 4

character "Hufflepuff"
  bravery 6
  intelligence 5
  ambition 3
  loyalty 9`
}
