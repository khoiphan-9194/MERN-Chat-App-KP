import decode from 'jwt-decode';

class AuthService {
  getProfile() {
    console.log(decode(this.getToken()))
    return decode(this.getToken());
  }
  
  loggedIn() {
    // Checks if there is a saved token and it's still valid
    const token = this.getToken();
    // console.log(this.isTokenExpired(token));
    // console.log(!this.isTokenExpired(token));

    return !!token && !this.isTokenExpired(token);

  }



  isTokenExpired(token) {
    // Decode the token to get its expiration time that was set by the server
    const decoded = decode(token);
    // If the expiration time is less than the current time (in seconds), the token is expired and we return `true`
    if (decoded.exp < Date.now() / 1000) {
      localStorage.removeItem('id_token');
      window.alert('Session Expired. Please login again');
       location.replace(`http://localhost:3000`);
   

      return true;
    }
    // If token hasn't passed its expiration time, return `false`
    return false;
  }


  getToken() {
    // Retrieves the user token from localStorage
    return localStorage.getItem('id_token');
  }

  login(idToken) {
    // Saves user token to localStorage
    localStorage.setItem('id_token', idToken);
    setTimeout(() => {  window.location.assign('/'); }, 1000)

  }

  logout() {
    // Clear user token and profile data from localStorage
    localStorage.removeItem('id_token');
    // this will reload the page and reset the state of the application
    window.location.assign('/');
  }
}


export default new AuthService();
