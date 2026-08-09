const { BaseApi } = require('./BaseApi');

class AuthApi extends BaseApi {
  /**
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials) {
    return this.request.post(this.url('/users/login'), {
      data: credentials,
      headers: this.headers({ 'Content-Type': 'application/json' }),
    });
  }

  /**
   * @param {object} user - UserRequest body from testData.buildValidRegistrationUser()
   */
  async register(user) {
    return this.request.post(this.url('/users/register'), {
      data: user,
      headers: this.headers({ 'Content-Type': 'application/json' }),
    });
  }

  async me() {
    return this.request.get(this.url('/users/me'), {
      headers: this.headers(),
    });
  }

  async logout() {
    return this.request.get(this.url('/users/logout'), {
      headers: this.headers(),
    });
  }
}

module.exports = { AuthApi };
