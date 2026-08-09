const { BaseApi } = require('./BaseApi');

/**
 * User profile and registration.
 * Payloads: testData.buildValidRegistrationUser(), buildDuplicateEmailRegistration(), etc.
 */
class UsersApi extends BaseApi {
  /**
   * @param {object} user - UserRequest from testData.buildValidRegistrationUser()
   * @param {{ expectedStatus?: number }} [options]
   */
  async register(user, options = {}) {
    return this.post('/users/register', {
      data: user,
      expectedStatus: options.expectedStatus,
    });
  }

  /**
   * @param {{ expectedStatus?: number }} [options]
   */
  async me(options = {}) {
    return this.get('/users/me', { expectedStatus: options.expectedStatus });
  }

  /**
   * @param {{ expectedStatus?: number }} [options]
   */
  async logout(options = {}) {
    return this.get('/users/logout', { expectedStatus: options.expectedStatus });
  }

  /**
   * @param {string} userId
   * @param {{ expectedStatus?: number }} [options]
   */
  async getById(userId, options = {}) {
    return this.get(`/users/${userId}`, { expectedStatus: options.expectedStatus });
  }
}

module.exports = { UsersApi };
