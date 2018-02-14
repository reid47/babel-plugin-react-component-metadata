import * as u from './ast-utils';

const defaultOptions = {
  propTypesAlias: 'PropTypes',
  metadataPropertyName: 'metadata',
  helpersName: u.id('metadataHelpers')
};

const setOptions = {};

export const getOption = (state, optionName) => {
  return (
    state.opts[optionName] ||
    setOptions[optionName] ||
    defaultOptions[optionName]
  );
};

export const setOption = (optionName, optionValue) => {
  setOptions[optionName] = optionValue;
};
