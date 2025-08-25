// Type definitions as JSDoc comments for better IDE support

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} email
 * @property {'user'|'admin'} role
 */

/**
 * @typedef {Object} Annotation
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {string} text
 * @property {'highlight'|'arrow'|'text'} type
 */

/**
 * @typedef {Object} TourStep
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} [screenshot]
 * @property {Annotation[]} annotations
 * @property {number} order
 */

/**
 * @typedef {Object} Tour
 * @property {string} _id
 * @property {string} title
 * @property {string} description
 * @property {string|User} creator
 * @property {TourStep[]} steps
 * @property {boolean} isPublic
 * @property {string} [shareUrl]
 * @property {number} views
 * @property {number} clicks
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} AnalyticsOverview
 * @property {number} totalTours
 * @property {number} totalViews
 * @property {number} totalClicks
 * @property {number} publicTours
 */

/**
 * @typedef {Object} EngagementData
 * @property {string} date
 * @property {number} views
 * @property {number} clicks
 */

/**
 * @typedef {Object} TopTour
 * @property {string} id
 * @property {string} title
 * @property {number} views
 * @property {number} clicks
 * @property {boolean} isPublic
 */

/**
 * @typedef {Object} AnalyticsData
 * @property {AnalyticsOverview} overview
 * @property {EngagementData[]} engagementData
 * @property {TopTour[]} topTours
 */

export {};