// Pluralize a noun based on a count.
export const pN = (singular, pluralArg) => {
  const plural = pluralArg || `${singular}s`;
  return (count) => count === 1 ? singular : plural;
}

// Pluralize a verb based on a subject object.
export const pV = (plural, singularArg) => {
  const singular = singularArg || `${plural}s`;
  return (subject) => subject.grammar.isPlural ? plural : singular;
}