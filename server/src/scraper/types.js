/**
 * @typedef {Object} MangaInfo
 * @property {string} title
 * @property {string} [author]
 * @property {string} [description]
 * @property {string} [coverUrl]
 * @property {string[]} [genres]
 * @property {string} sourceName
 * @property {string} sourceUrl
 */

/**
 * @typedef {Object} ChapterInfo
 * @property {string} id
 * @property {number} chapterNumber
 * @property {string} title
 * @property {string} url
 */

/**
 * @typedef {Object} MangaSourceAdapter
 * @property {string} name
 * @property {string[]} domains
 * @property {(url: string) => boolean} canHandle
 * @property {(url: string) => Promise<MangaInfo>} getMangaInfo
 * @property {(url: string) => Promise<ChapterInfo[]>} getChapters
 * @property {(url: string) => Promise<string[]>} getChapterImages
 */

export const ADAPTER_STATUS = {
  DETECTED: 'detected',
  FETCHING_INFO: 'fetching_info',
  DOWNLOADING_IMAGES: 'downloading_images',
  READY: 'ready',
  FAILED: 'failed',
};
