/* eslint-env es6 */
// @ts-check

const fs = require('fs');

/** @returns {void} */
function main() {
  const PATH_PREFIX = `src`;
  const BUILD_INFO_FILE = `${PATH_PREFIX}/app/app.build.ts`;
  const INDEX_HTML_FILE = `${PATH_PREFIX}/index.html`;

  const BUILD_VERSION = getVersion();
  const BUILD_DATE = Date.now();
  const BUILD_DATE_FORMATTED = `${formatDate(BUILD_DATE)} (${BUILD_DATE})`;

  updateBuildFile(
    BUILD_INFO_FILE,
    BUILD_VERSION,
    BUILD_DATE_FORMATTED,
    BUILD_DATE,
  );
  updateIndexHtml(
    INDEX_HTML_FILE,
    BUILD_VERSION,
    BUILD_DATE_FORMATTED,
  );
}

/**
 * Returns version from package.json
 * @returns {string}
 */
function getVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    return packageJson.version;
  } catch (err) {
    console.error('Error reading package.json:', err);
    return '0.0.0';
  }
}

/**
 * @param {string} filePath
 * @param {string} buildVersion
 * @param {string} buildDateFormatted
 * @param {number} buildDate
 * @returns {void}
 */
function updateBuildFile(
  filePath,
  buildVersion,
  buildDateFormatted,
  buildDate
) {
  const contents = buildFileTemplate(buildVersion, buildDate);

  // fs.writeFileSync(filePath, contents);
  fs.writeFile(filePath, contents, (err) => {
    if (err) console.error('Error occurred:', err);
    const msg = msgLog(filePath, buildVersion, buildDateFormatted);
    console.log(msg);
  });
}

/**
 * @param {string} buildVersion
 * @param {number} buildDate
 * @returns {string}
 */
function buildFileTemplate(buildVersion, buildDate) {
  return `// === Auto Generated during deployment build === //

/** MS since UNIX epoch - can use with angular date pipe */
export const APP_BUILD_DATE: number = ${buildDate};
/** Version extracted from package.json */
export const APP_BUILD_VERSION: string = '${buildVersion}';
`;
}

/**
 * @param {string} filePath
 * @param {string} buildVersion
 * @param {string} buildDateFormatted
 * @returns {void}
 */
function updateIndexHtml(
  filePath,
  buildVersion,
  buildDateFormatted,
) {
  let contents = fs.readFileSync(filePath, 'utf-8');

  // Replace existing {{BUILD_VERSION}} and {{BUILD_DATE}} placeholders
  contents = contents.replace(/{{BUILD_VERSION}}/g, buildVersion);
  contents = contents.replace(/{{BUILD_DATE_FORMATTED}}/g, buildDateFormatted);

  // fs.writeFileSync(filePath, html);
  fs.writeFile(filePath, contents, (err) => {
    if (err) console.error('Error occurred:', err);
    const msg = msgLog(filePath, buildVersion, buildDateFormatted);
    console.log(msg);
  });
}

/**
 * @param {string} filePath
 * @param {string} buildVersion
 * @param {string} buildDateFormatted
 * @returns {string}
 */
function msgLog(filePath, buildVersion, buildDateFormatted) {
  return `Build ${filePath}: Version ${buildVersion} - Date ${buildDateFormatted}`;
}

/**
 * Turns date ms number to formatted ISO date string YYYY-MM-DDTHH:mm:ss.sssZ
 * @param {number} dateNum
 * @returns {string}
 */
function formatDate(dateNum) {
  const myDate = new Date(dateNum);
  return myDate.toISOString();
}

main();
