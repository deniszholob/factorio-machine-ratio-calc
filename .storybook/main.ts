import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import type { StorybookConfig } from '@storybook/angular';

const storyFiles = '*.stories.@(js|jsx|ts|tsx)';
const docsFiles = '*.mdx';
const config: StorybookConfig = {
  stories: [
    `./**/${storyFiles}`,
    `../src/app/**/${storyFiles}`,
    `./**/${docsFiles}`,
    `../src/app/**/${docsFiles}`,
  ],
  experimental_indexers: async (indexers = []) =>
    indexers.map((indexer) => ({
      ...indexer,
      createIndex: async (fileName, options) => {
        const entries = await indexer.createIndex(fileName, options);
        return entries.map((entry) => {
          // Keep default indexing, then replace only the sidebar title.
          const sourceTitle = entry.title ?? fileName;
          const nextTitle = flattenTitle(sourceTitle);
          if (!nextTitle || nextTitle === sourceTitle) {
            return entry;
          }

          // If title changes, drop precomputed __id to avoid stale id mismatch
          // during CSF import/HMR. Storybook will regenerate id from new title.
          const entryWithoutStaleId = { ...entry };
          delete entryWithoutStaleId.__id;

          return {
            ...entryWithoutStaleId,
            title: nextTitle,
          };
        });
      },
    })),
  addons: [getAbsolutePath('@storybook/addon-docs')],
  framework: {
    name: getAbsolutePath('@storybook/angular'),
    options: {},
  },
};

export default config;

// To customize your webpack configuration you can use the webpackFinal field.
// Check https://storybook.js.org/docs/react/builders/webpack#extending-storybooks-webpack-config
// and https://nx.dev/packages/storybook/documents/custom-builder-configs

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

function flattenTitle(sourceTitle: string): string {
  // Convert path-like auto titles to readable recursive sidebar groups.
  // Example:
  // components/production-chain-editor/.../catalog-recipe-form/catalog-recipe-form.component
  // -> Components/Production Chain Editor/.../Catalog Recipe Form
  const humanized = sourceTitle
    .split('/')
    .filter(Boolean)
    .map((segment) => humanizeSegment(segment))
    .filter(Boolean);

  // Storybook auto-title often repeats the final directory as "*.component".
  // Collapse adjacent duplicates so we keep folder hierarchy without noise.
  const deduped = humanized.filter(
    (segment, index, all) =>
      index === 0 || segment.toLowerCase() !== all[index - 1].toLowerCase(),
  );

  return deduped.join('/');
}

function humanizeSegment(value: string): string {
  // Normalize a path segment into a human-friendly sidebar label.
  // Removes story/component suffixes and converts kebab/snake/dot case to words.
  const cleaned = value.replace(/\.component$/iu, '');
  const words = cleaned.split(/[-_.\s]+/u).filter(Boolean);

  return words
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}
