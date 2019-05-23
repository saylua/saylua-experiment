import React from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import WildernessIllustration from './WildernessIllustration';

export default function EncounterScene(props) {
  const { encounter } = props;
  return (
    <div className="interaction-container">
      <WildernessIllustration
        region={{
          name: 'Sayleus',
          canonName: 'sayleus',
          availableSpecies: {
            common: ['chirling', 'gam'],
            rare: ['vela'],
          },
          treeImg: 'tree2_small',
          overlayColor: { r: 140, g: 190, b: 200, a: 0.3 },
          horizon: 0.3,
        }}
        activeSprite={{}}
      />
      <div className="interaction-content">

        <ReactMarkdown source={encounter.text} />
        {encounter.choices.map(choice => (
          <button
            className="button"
            type="button"
            key={choice.buttonText}
            onClick={props.finish}
          >
            {choice.buttonText}
          </button>
        ))}
      </div>
    </div>
  );
}

EncounterScene.propTypes = {
  encounter: PropTypes.object.isRequired,
  finish: PropTypes.func.isRequired,
};