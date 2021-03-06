import { capitalizeFirst } from '../../utils/utils';
import { _re, _ve } from './linkingVerbs';

export const they = actor => actor.grammar.pronouns.subject;
export const They = actor => capitalizeFirst(they(actor));

export const they_re = actor => `${actor.grammar.pronouns.subject}${
  _re(actor)}`;
export const They_re = actor => capitalizeFirst(they_re(actor));

export const they_ve = actor => `${actor.grammar.pronouns.subject}${
  _ve(actor)}`;
export const They_ve = actor => capitalizeFirst(they_re(actor));

export const them = actor => actor.grammar.pronouns.object;
export const Them = actor => capitalizeFirst(them(actor));

export const their = actor => actor.grammar.pronouns.possessive;
export const Their = actor => capitalizeFirst(their(actor));

export const theirs = actor => actor.grammar.pronouns.possessiveStrong;
export const Theirs = actor => capitalizeFirst(theirs(actor));

export const themself = actor => actor.grammar.pronouns.reflexive;
export const Themself = actor => capitalizeFirst(themself(actor));


export const THEY_PRONOUNS = {
  pronouns: {
    subject: 'they',
    object: 'them',
    possessive: 'their',
    possessiveStrong: 'theirs',
    reflexive: 'themself',
  },
  isPlural: true,
};

export const HE_PRONOUNS = {
  pronouns: {
    subject: 'he',
    object: 'him',
    possessive: 'his',
    possessiveStrong: 'his',
    reflexive: 'himself',
    usesPluralVerbs: false,
  },
  isPlural: false,
};

export const SHE_PRONOUNS = {
  pronouns: {
    subject: 'she',
    object: 'her',
    possessive: 'her',
    possessiveStrong: 'hers',
    reflexive: 'herself',
    usesPluralVerbs: false,
  },
  isPlural: false,
};

export const ALL_PRONOUNS = [THEY_PRONOUNS, HE_PRONOUNS, SHE_PRONOUNS];
