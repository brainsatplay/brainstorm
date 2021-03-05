

brainsatplay.showLogin = true;
brainsatplay.showSignUp = false;
brainsatplay.showUserControls = false;

function openConnectCard() {
  if (document.getElementById("connect-card")){
  document.getElementById("connect-card").style.transform = "translateX(0%)";
  document.getElementById("connect-card").style.zIndex = "1001";
  document.getElementById("cToggle").onclick =function() {closeConnectCard()};
  }
}

  function closeConnectCard() {
    if (document.getElementById("connect-card")){
    document.getElementById("connect-card").style.transform = "translateX(100%)";
    document.getElementById("cToggle").onclick = function() {openConnectCard()};
    document.getElementById("connect-card").style.zIndex = "1000";
    }
  }

  // User Controls

function toggleUserControls(){
    brainsatplay.showUserControls = !brainsatplay.showUserControls;

    if (brainsatplay.showUserControls){
        document.getElementById('controls-container').style.zIndex = '0'
        document.getElementById('controls-container').style.opacity = '1'
    } else {
        document.getElementById('controls-container').style.opacity = '0'
        document.getElementById('controls-container').style.zIndex = '-1'
    }

    if (game.bluetooth.connected){
        document.getElementById('raw-consent').style.display = 'block'
    } else {
        document.getElementById('raw-consent').style.display = 'none'
    }
}

// Access
function toggleAccess(){
    if (game.info.access == 'private'){
        game.access('public')
        document.getElementById('access-mode').innerHTML = 'Public Mode'
    } else {
        document.getElementById('access-mode').innerHTML = 'Private Mode'
        game.access('private')
    }
}

// Access
function toggleConsent(type){
    game.consent(type,!game.me.consent[type])
}

// Login
async function toggleLoginScreen(){
    brainsatplay.showLogin = !brainsatplay.showLogin;

    if (brainsatplay.showLogin){
        document.getElementById('login-container').style.zIndex = '0'
        document.getElementById('login-container').style.opacity = '1'
    } else {
        document.getElementById('login-container').style.opacity = '0'
        document.getElementById('login-container').style.zIndex = '-1'
    }
}

function toggleSignUpScreen(){
    brainsatplay.showSignUp = !brainsatplay.showSignUp;

    if (brainsatplay.showSignUp){
        document.getElementById('signup-container').style.zIndex = '0'
        document.getElementById('signup-container').style.opacity = '1'
    } else {
        document.getElementById('signup-container').style.opacity = '0'
        document.getElementById('signup-container').style.zIndex = '-1'
    }
}

  async function login(type='guest'){
    let form = document.getElementById('login-form')
    let formDict = {}
    if (type === 'guest'){
        formDict.guestaccess = true
    } else {
        let formData = new FormData(form);
        for (var pair of formData.entries()) {
            formDict[pair[0]] = pair[1]; 
        }
        formDict.guestaccess = false
    }

    await game.connect(formDict).then((resDict) =>{
        if (resDict.result == 'OK'){
            form.reset()
            toggleLoginScreen();
            toggleUserControls();
            document.getElementById('username').innerHTML = game.me.username
        } else {
            document.getElementById('login-message').innerHTML = resDict.msg
        }
    })
}

async function signup(){
    let form = document.getElementById('signup-form')
    let formData = new FormData(form);
    let formDict = {}
    for (var pair of formData.entries()) {
        formDict[pair[0]] = pair[1]; 
    }

    if (formDict['username'] === ''){
        document.getElementById('signup-message').innerHTML = "username is empty. please try again."
    } else if (formDict['password'] ===''){
        document.getElementById('signup-message').innerHTML = "password is empty. please try again."
    }  else if (formDict['password'] !== formDict['confirm-password']) {
            document.getElementById('signup-message').innerHTML = "passwords don't match. please try again."
    }
    else {

        let resDict = await game.signup(formDict);
        if (resDict.result == 'OK'){
            form.reset()
            toggleLoginScreen();
            toggleSignUpScreen();
        } else {
            document.getElementById('signup-message').innerHTML = resDict.msg
        }
    }
}


  
  class ConnectCard extends HTMLElement {
    constructor() {
      super();
    }

  connectedCallback() {
    let html = `
    <style>

    #connect-card {
      box-sizing: border-box;
      display: block;
      position: fixed;
      top: 0;
      right: 0;
      width: 40vw;
      min-width: 350px;
      max-width: 100vw;
      height: 100vh;
      transform: translateX(100%);
      padding: 25px;
      background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6));
      z-index: 1000;

      transition: 0.5s ease-in-out;
      -o-transition: 0.5s ease-in-out;
      -ms-transition: 0.5s ease-in-out;
      -moz-transition: 0.5s ease-in-out;
      -webkit-transition: 0.5s ease-in-out;
  }

  #connect-card .small{
      font-size: 10px;
  }
  
  #connect-card p{
      font-size: 80%
  }
  
  #connect-card ol{
      font-size: 80%
  }
  
  #connect-card ol p{
      font-size: 100%
  }
  
  #connect-card h4{
      margin: 0px;
  }

  #connect-card a{
      color: #6a8eb0;
      text-decoration: none;
  }
  
  #connect-card a:visited{
      color: gray;
  }

  .connect-icon {
      box-sizing: border-box;
      position: fixed;
      display: flex;
      justify-content: center;
      align-items: center;
      right: 100%;
      top: 100px;
      transform: translateX(-100%);
      padding: 1em;
      width: 40px;
      z-index: 0;
      text-align: center;
      transition: 0.5s ease-in-out;
      -o-transition: 0.5s ease-in-out;
      -ms-transition: 0.5s ease-in-out;
      -moz-transition: 0.5s ease-in-out;
      -webkit-transition: 0.5s ease-in-out;
  }

  #connect-label {
    position: relative;
    display: block;
    white-space: nowrap
  }

  #label-text {
      color: white;
      padding: 10px 10px;
      border-radius: 6px;
      transform: translateY(-50%) translateX( calc(-100% - 40px));
      position: fixed;
      z-index: 1;
  }


  /* Login */
form input {
    width: 100%; height: 100%; padding: 10px 0px; display: flex; align-items: center; justify-content:center; color: white; background:transparent; border: transparent; border-bottom: 1px solid white;
}

input:focus{
    outline: none;
}

.form-container{
    box-sizing: border-box;
    display: flex;
    position: fixed;
    justify-content:center;
    align-items: center;
    text-align: center;
    flex-wrap: wrap;
    top: 0;
    left: 0;
    padding: 25px;
    opacity: 0;
    height: 100vh;
    width: 100%;
    z-index: -1;
    transition: 0.5s ease-in-out;
    -o-transition: 0.5s ease-in-out;
    -ms-transition: 0.5s ease-in-out;
    -moz-transition: 0.5s ease-in-out;
    -webkit-transition: 0.5s ease-in-out;
}

.form-container button {
    margin: 10px;
    min-height: 0px;
}

.form-container input::placeholder {
    color: darkgray;
}

.form-context {
    flex-grow: 1;
    max-width: 500px;
}

.form-context form {
    width: 100%;
}

#login-container {
    opacity: 100%;
    z-index: 0;
}

#login{
    width: 75%;
    font-size: 20px;
    text-align: center;
    z-index:1;
}

#signup{
    width: 75%;
    font-size: 20px;
    text-align: center;
    z-index: 1;
}

.login-element{
    margin:20px;
}

.login-buttons{
    display: flex;
    flex-wrap: wrap;
    justify-content:center;
    align-items: center;
    flex-basis: 100%;
}

.login-buttons button{
    flex-grow: 1;
}

#login-button {
    width: 100%;
}

.other-buttons{
    display: flex;
    justify-content:center;
    align-items: center;
    flex-basis: 100%;
}

.other-buttons button{
    flex-grow: 1;
}

#controls-container {
    display: flex;
    justify-content:center;
    align-items: flex-start;
    height: 100vh;
    padding: 25px;
    opacity: 0;
    z-index: -1;
    transition: 0.5s ease-in-out;
    -o-transition: 0.5s ease-in-out;
    -ms-transition: 0.5s ease-in-out;
    -moz-transition: 0.5s ease-in-out;
    -webkit-transition: 0.5s ease-in-out;
}

/* Slider */
  /* The switch - the box around the slider */
  .switch {
    position: relative;
    display: inline-block;
    width: calc(60px / 2);
    height: calc(34px / 2);
  }
  
  /* Hide default HTML checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  /* The slider */
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: .4s;
    transition: .4s;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: calc(26px / 2);
    width: calc(26px / 2);
    left: calc(4px / 2);
    bottom: calc(4px / 2);
    background-color: white;
    -webkit-transition: .4s;
    transition: .4s;
  }
  
  input:checked + .slider {
    background-color: #2196F3;
  }
  
  input:focus + .slider {
    box-shadow: 0 0 1px #2196F3;
  }
  
  input:checked + .slider:before {
    -webkit-transform: translateX(calc(26px / 2));
    -ms-transform: translateX(calc(26px / 2));
    transform: translateX(calc(26px / 2));
  }
  
  .slider.round {
    border-radius: 34px;
  }
  
  .slider.round:before {
    border-radius: 50%;
  }

  #connection-toggle {
    width: 150px;
}

#access-switch{
    margin-left: 10px;
  }

    </style>

    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css" rel="stylesheet">
      <div id="connect-card">
      <div id="cToggle" onclick="openConnectCard()" class="connect-icon">
      <i class="fas fa-gamepad fa-lg"></i>
      <div id="connect-label">
        <span id="label-text"><p class="small">Play with Others</p></span>
      </div>
      </div>

      <div id="controls-container">
      <div>
        <h3>Welcome <span id="username"></span>.</h3>
        <hr/>
        <div id="game-consent">
        <p>Consent to Send Game Data</p>
        <label id="access-switch" class="switch">
            <input type="checkbox" onchange="toggleConsent('game')">
            <span class="slider round"></span>
          </label>
        </div>
        <div id="raw-consent">
        <p>Consent to Send Raw Brain Data</p>
        <label id="access-switch" class="switch">
            <input type="checkbox" onchange="toggleConsent('raw')">
            <span class="slider round"></span>
          </label>
        </div>
        <div id="access-mode-div">
        <p id="access-mode">Public Mode</p>
        <label id="access-switch" class="switch">
            <input type="checkbox" onchange="toggleAccess()" checked>
            <span class="slider round"></span>
          </label>
        </div>
        <br/>
        <br/>
        <button onclick="game.disconnect();toggleUserControls();toggleLoginScreen();closeConnectCard()">Disconnect from Game</button>
    </div>
    </div>


      <div id="login-container" class="form-container">
      <div id="login" class="form-context">
          <h3>Sign In</h3>
          <p id="login-message" class="small"></p>
          <div>
              <form id="login-form" action="">
                  <div class="login-element">
                      <input type="text" name="username" autocomplete="off" placeholder="Username or email"/>
                  </div>
                  <div class="login-element" style="text-align:right;">
                      <input type="password" name="password" autocomplete="off" placeholder="Password"/>
                      <a class="small text" href="https://brainsatplay.com/forgot">Forgot password?</a>
                  </div>
              </form>
                <div class="login-buttons">
                    <button id="login-button" onclick="login('profile')">Sign In</button>
                </div>
                <div class="other-buttons">
                    <button onclick="toggleLoginScreen(); toggleSignUpScreen()">Sign Up</button>
                    <button onclick="login('guest')">Guest Access</button>
                </div>
            </div>
        </div>
    </div>

    <div id="signup-container" class="form-container">
    <div id="signup" class="form-context">
        <h3>Sign Up</h3>
        <p id="signup-message" class="small"></p>
        <div class='flex'>
            <form id="signup-form" action="">
                <div class="login-element">
                    <input type="email" name="email" autocomplete="off" placeholder="Email"/>
                </div>
                <div class="login-element">
                    <input type="text" name="username" autocomplete="off" placeholder="Username"/>
                </div>
                <div class="login-element">
                    <input type="password" name="password" autocomplete="off" placeholder="Password"/>
                </div>
                <div class="login-element">
                    <input type="password" name="confirm-password" autocomplete="off" placeholder="Confirm Password"/>
                </div>
                <div class="login-element">
                    <input type="text" name="code" autocomplete="off" placeholder="Code (optional)"/>
                </div>
            </form>
                <div class="login-buttons">
                    <button onclick="signup()">Sign Up</button>
                    <button onclick="toggleLoginScreen(); toggleSignUpScreen()">Go Back</button>
                </div>
            </div>
        </div>
    </div>
    `;
    this.innerHTML = html
  }
}

  customElements.define('connect-card', ConnectCard);
