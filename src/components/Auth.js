class Auth {
  login(cb) {
    localStorage.setItem('intelliproc_auth', '1');
    if (cb) cb();
  }
  logout(cb) {
    localStorage.removeItem('intelliproc_auth');
    localStorage.removeItem('intelliproc_user');
    if (cb) cb();
  }
  isAuthenticated() {
    return localStorage.getItem('intelliproc_auth') === '1';
  }
}

export default new Auth();
