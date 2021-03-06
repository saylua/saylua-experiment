import { randomChoice, capitalizeFirst } from '../../utils/utils';
import soulName from './name/soulName';
import { CANONICAL_SPRITE_COATS, SPRITE_COATS } from './spriteEncyclopedia';
import { ALL_PRONOUNS } from '../Language/pronouns';

export const generateCoat = (speciesList) => {
  const { common, rare } = speciesList;
  let species;
  if (Math.random() < 0.3) {
    species = randomChoice(rare);
  } else {
    species = randomChoice(common);
  }

  let color = CANONICAL_SPRITE_COATS[species];
  if (Math.random() < 0.4) {
    color = randomChoice(SPRITE_COATS[species]);
  }
  return {
    species,
    color,
  };
};

export const generateSprite = (speciesList) => {
  const { species, color } = generateCoat(speciesList);
  return {
    name: capitalizeFirst(soulName()),
    species,
    color,
    trust: -5,
    distance: 5,
    grammar: randomChoice(ALL_PRONOUNS),
  };
};

// Tag function to pass down a sprite
export const spriteText = sprite => (strings, ...keys) => {
  let result = '';
  for (let i = 0; i < strings.length; i += 1) {
    result = result.concat(strings[i]);
    if (i < keys.length && typeof keys[i] === 'function') {
      result = result.concat(keys[i](sprite));
    } else if (i < keys.length) {
      result = result.concat(keys[i]);
    }
  }
  return result;
};
