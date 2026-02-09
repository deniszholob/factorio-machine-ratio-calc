// === App level constants === //

/** Contains constants for the app */
export const APP_INFO: AppInfo = {
  factoryTime: {
    name: 'Factory Time Game',
    url: 'https://deniszholob.github.io/factory-time/',
    title: 'Factory Time Game',
    icon: 'fas fa-industry',
  },
};

/** App level constants */
export interface AppInfo {
  factoryTime: Hyperlink;
}

/** Hyperlink data */
export interface Hyperlink {
  name: string;
  url: string;
  title?: string;
  /** Font Awesome icon class */
  icon?: string;
}
