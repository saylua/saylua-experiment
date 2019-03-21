import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import soulName from './helpers/name/soulName';
import { capitalizeFirst, randomChoice } from './helpers/utils';
import './App.css';

import SpritePortrait from './sharedComponents/SpritePortrait/SpritePortrait';
import SpriteHeadshot from './sharedComponents/SpriteHeadshot/SpriteHeadshot';

import { INTERACTION_TYPES } from './gameData/spriteInteractions';
import { SHE_PRONOUNS, HE_PRONOUNS, THEY_PRONOUNS } from './textData/pronouns';
import { SPRITE_COATS } from './textData/spriteEncyclopedia';
import { Their, TheyRe, They, their, they,
  them } from './textGenerators/pronouns';
import { token, coat, call, purr, growl, nose } from './textGenerators/interactions';
import { addWildSprite, befriendWildSprite, setActiveSprite, interactWithSprite,
  clearInteractions } from './reducers/spriteReducer';
import { incrementDay } from './reducers/gameReducer';

const ADOPTION_THRESHOLD = 5;

const pickGenerator = (templateList, sprite) => randomChoice(templateList)(sprite);

const YOU_HAVE_BONDED_TEMPLATES = [
  sprite => `As you smile at ${sprite.name}, ${they(sprite)} approach you,
    eager to receive your delicate pets.`,
  sprite => `The sun shines brightly on you and ${sprite.name} as you
    stroke ${their(sprite)} ${coat(sprite)}.`,
  sprite => `${sprite.name} ${purr(sprite)}s happily as you stroke ${their(sprite)}
    ${coat(sprite)}.`,
  sprite => `${sprite.name} seems a bit aloof when you try to pet
    ${them(sprite)}.`,
  sprite => `${sprite.name} longingly looks into the distance, seeming
    curious about adventure.`,
  sprite => `Gently cleaning ${their(sprite)} ${coat(sprite)}, ${sprite.name} preens a bit.`,
  sprite => `You give ${sprite.name} a little pat on the head.`,
  sprite => `${sprite.name} brings you a little ${token(sprite)}.`,
];

// Event text template ordered linearly based on trust values.
const EVENT_TEXT_TEMPLATES = ([
  sprite => `In the distance, you see a ${sprite.species}.`,
  sprite => `As you approach, the ${sprite.species} tucks in ${their(sprite)}
    ${coat(sprite)} and scurries away. ${TheyRe(sprite)} hiding under a bush now.`,
  sprite => `The ${sprite.species} peeks ${their(sprite)}
    head out of the bush. ${They(sprite)} cocks ${their(sprite)} head
    curiously. But as you reach out your hand, ${they(sprite)}
    quickly retreats back into the bushes.`,
  sprite => `You wait patiently outside the bush with your hand gently
    extended. The ${sprite.species} slowly emerges from the leaves,
    ${purr(sprite)}ing softly, gently. You stroke ${their(sprite)}
    silky smooth ${coat(sprite)}, caressing each tuft carefully.`,
  sprite => `The ${sprite.species} ${purr(sprite)}s delicately. You're petting
    ${them(sprite)}! They tell you that they're name is ${sprite.name}.`,
  sprite => `You look around. You don't notice ${sprite.name} anywhere.
    Did ${they(sprite)} leave? Tuning in intently, you make out a muted
    ${call(sprite)}ing sound, coming from behind a rock. You can see ${sprite.name}'s
    ${nose(sprite)}. ${Their(sprite)} eyes. As you approach, ${they(sprite)} take a few
    hops forward. ${sprite.name} ${purr(sprite)}s as you pet ${them(sprite)}.`,
  sprite => `You're sitting in a meadow with ${sprite.name} and start gently
    stroking ${their(sprite)} ${coat(sprite)}. It's a warm day, and ${sprite.name}
    is so very soft.`,
  sprite => pickGenerator(YOU_HAVE_BONDED_TEMPLATES, sprite),
]);

const generateTextBasedOnTrustLevel = (templateList, sprite, trustIntervalArg) => {
  if (!sprite) return null;
  const trustInterval = trustIntervalArg || 3;
  const templateIndex = Math.max(0,
    Math.min(Math.floor(sprite.trust / trustInterval), templateList.length - 1));
  return templateList[templateIndex](sprite);
};

const generateSprite = () => {
  const species = randomChoice(['arko', 'chirling', 'loxi', 'gam']);
  const color = randomChoice(SPRITE_COATS[species]);
  return {
    name: capitalizeFirst(soulName()),
    species,
    color,
    trust: 0,
    pronouns: randomChoice([SHE_PRONOUNS, HE_PRONOUNS,
      THEY_PRONOUNS]),
  };
};

class App extends Component {
  constructor(props) {
    super(props);
    props.addWildSprite(generateSprite());
  }

  getInteractionCount(interactionType) {
    const spriteId = this.currentSprite().name;
    const { interactionCounts } = this.props;
    if (!(spriteId in interactionCounts)) return 0;
    if (!(interactionType in interactionCounts[spriteId])) return 0;
    return interactionCounts[spriteId][interactionType];
  }

  befriendWildSprite() {
    const newSprite = generateSprite();
    this.props.befriendWildSprite(newSprite);
  }

  currentTime() {
    const date = new Date();
    const { dayOffset } = this.props;
    date.setDate(date.getDate() + dayOffset);
    return date;
  }

  hasBeenADaySincePlaying() {
    const { lastPlayed } = this.props;
    const lastPlayedDate = new Date(lastPlayed);
    const now = this.currentTime();

    return now.toDateString() !== lastPlayedDate.toDateString();
  }

  currentSprite() {
    const { activeSpriteId, spritesById, wildSpriteId } = this.props;
    if (!activeSpriteId) return spritesById[wildSpriteId];
    return spritesById[activeSpriteId];
  }

  canPlay(interactionType) {
    const interaction = INTERACTION_TYPES[interactionType];
    if (!interaction.maxPerDay) return true;
    const interacted = this.getInteractionCount(interactionType);
    return interacted < interaction.maxPerDay || this.hasBeenADaySincePlaying();
  }

  interactWithSprite(interactionType) {
    const sprite = this.currentSprite();
    if (!this.canPlay(interactionType)) return;
    const { trustIncrease } = INTERACTION_TYPES[interactionType];

    if (this.hasBeenADaySincePlaying()) {
      this.props.clearInteractions();
    }

    const lastPlayedTimestamp = this.currentTime().getTime();

    this.props.interactWithSprite(sprite.name, interactionType, trustIncrease,
      lastPlayedTimestamp);

    if ((sprite.trust + trustIncrease > ADOPTION_THRESHOLD)
        && !this.props.activeSpriteId) {
      this.befriendWildSprite();
    }
  }

  render() {
    const sprite = this.currentSprite();
    if (!sprite) return null;
    const { mySpriteIds, activeSpriteId } = this.props;
    const now = this.currentTime();
    const isWildSprite = !activeSpriteId;
    const eventText = generateTextBasedOnTrustLevel(
      EVENT_TEXT_TEMPLATES, sprite, 1
    );

    const interactText = interactionType => (sprite
      && INTERACTION_TYPES[interactionType].buttonTextTemplate(sprite));


    const clickSprite = () => this.interactWithSprite('pet');

    return (
      <div className="saylua">
        <div className="sprite-list">
          <button
            type="button"
            className={`change-sprite${isWildSprite ? ' selected' : ''}`}
            onClick={() => this.props.setActiveSprite()}
          >
            ?
          </button>
          {
            mySpriteIds.map(id => (
              <button
                type="button"
                className={`change-sprite${id === activeSpriteId ? ' selected' : ''}`}
                key={id}
                onClick={() => this.props.setActiveSprite(id)}
              >
                <SpriteHeadshot sprite={this.props.spritesById[id]} />
              </button>
            ))
          }
        </div>
        <div className="wilderness-background">
          <SpritePortrait
            sprite={sprite}
            petText={interactText('pet')}
            onClick={clickSprite}
          />
        </div>
        <h2>{isWildSprite ? `A wild ${sprite.species}` : sprite.name}</h2>
        <p>
          {`Trust level: ${sprite.trust}`}
        </p>
        <p className="event-text">{eventText}</p>
        {
          Object.keys(INTERACTION_TYPES).map(interaction => (
            <button
              type="button"
              key={interaction}
              onClick={() => {
                this.interactWithSprite(interaction);
              }}
              disabled={this.canPlay(interaction) ? undefined : true}
            >
              {interactText(interaction)}
            </button>
          ))
        }

        <p>
          {`The date is ${now.toLocaleString()}`}
        </p>
        <button type="button" onClick={this.props.incrementDay}>Go to sleep</button>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  spritesById: state.sprite.spritesById,
  mySpriteIds: state.sprite.mySpriteIds,
  activeSpriteId: state.sprite.activeSpriteId,
  wildSpriteId: state.sprite.wildSpriteId,
  interactionCounts: state.sprite.interactionCounts,
  lastPlayed: state.sprite.lastPlayed,
  dayOffset: state.game.dayOffset,
});

const mapDispatchToProps = {
  addWildSprite,
  befriendWildSprite,
  setActiveSprite,
  interactWithSprite,
  clearInteractions,
  incrementDay,
};

App.propTypes = {
  addWildSprite: PropTypes.func.isRequired,
  befriendWildSprite: PropTypes.func.isRequired,
  setActiveSprite: PropTypes.func.isRequired,
  interactWithSprite: PropTypes.func.isRequired,
  clearInteractions: PropTypes.func.isRequired,
  incrementDay: PropTypes.func.isRequired,

  spritesById: PropTypes.object.isRequired,
  mySpriteIds: PropTypes.array.isRequired,
  activeSpriteId: PropTypes.string.isRequired,
  wildSpriteId: PropTypes.string.isRequired,
  interactionCounts: PropTypes.object.isRequired,
  lastPlayed: PropTypes.number.isRequired,
  dayOffset: PropTypes.number.isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
