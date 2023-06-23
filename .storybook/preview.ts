import { Parameters } from '@storybook/angular';
import { themes } from '@storybook/theming';

export const parameters: Parameters = {
  docs: { inlineStories: true, source: { state: 'open' }, theme: themes.dark },
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    hideNoControlsWarning: true,
    expanded: true,
    matchers: {
      color: /(background|color)/i,
      date: /Date$/,
    },
  },
  backgrounds: { default: 'dark' },
};
