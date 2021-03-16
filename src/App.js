import firebase from "firebase/app";
import "firebase/auth";
import { useState } from "react";
import './App.css';
import firebaseConfig from "./firebase.config";

firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false);

  const [user, setUser] = useState({
    isSingIn: false,
    name: '',
    email: '',
    password: '',
    photo: '',
  })
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSingIn = () => {
    firebase.auth()
      .signInWithPopup(googleProvider)
      .then((result) => {
        console.log(result.user)
        const { displayName, email, photoURL } = result.user;
        const singInUser = {
          isSingIn: true,
          name: displayName,
          email: email,
          photo: photoURL,
        }
        setUser(singInUser);

      })
      .catch((error) => {
        const errorMessage = error.message;
        console.log(errorMessage);
        const email = error.email;
        console.log(email);
      });
  }

  const handleFbSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(fbProvider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        // var credential = result.credential;

        // The signed-in user info.
        const user = result.user;
        console.log('fb user',result)
        
      })
      .catch((error) => {
        
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        console.log(error)

        // ...
      });
  }

  const handleSingOut = () => {
    firebase.auth().signOut()
      .then(res => {
        const singOutUser = {
          isSingIn: false,
          name: '',
          photo: '',
          email: '',
          error: '',
          success: false,
        }
        setUser(singOutUser);
        console.log(res)
      }).catch((error) => {

      });
  }

  const handleBlur = (e) => {
    let isFieldValid = true;
    console.log(e.target.name, e.target.value);
    if (e.target.name === 'email') {
      isFieldValid = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(e.target.value);
    }
    if (e.target.name === 'password') {
      isFieldValid = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(e.target.value);
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  }

  const handleSubmit = (e) => {
    if (newUser && user.email && user.password)
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then((res) => {

          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name)
          console.log('sign in info', res.user)
        })
        .catch((error) => {

          const errorCode = error.code;
          const errorMessage = error.message;

          console.log(errorCode, errorMessage)

          const newUserInfo = { ...user };
          newUserInfo.error = error.errorMessage;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });

    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);

        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;

          console.log(errorCode, errorMessage)

          const newUserInfo = { ...user };
          newUserInfo.error = error.errorMessage;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    e.preventDefault();         //submit korle page reload hbe na
  }

  const updateUserName = name => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name,
    })
      .then(function () {
        console.log('User Update successful.')
      }).catch(function (error) {
        console.log(error)
      });
  }
  return (
    <div className="App">
      {
        user.isSingIn ? <button onClick={handleSingOut}>Sign out</button> :
          <button onClick={handleSingIn}>Sign in</button>
      }
      <br />
      <button onClick={handleFbSignIn}>Facebook</button>
      {
        user.isSingIn &&
        <div>
          <p>Welcome, {user.name}</p>
          <p>Your Email : {user.email}</p>
          <img src={user.photo} alt="" />
        </div>

      }

      <h1>Our own Authentication</h1>
      <input type="checkbox" onChange={() => setNewUser(!newUser)} name="newUser" id="" />
      <label htmlFor="newUser"> New User Sign Up</label>

      <form action="" onSubmit={handleSubmit}>
        {
          newUser && <input type="text" onBlur={handleBlur} name="name" placeholder="Your Name" />
        }
        <br />
        <input type="text" onBlur={handleBlur} name="email" placeholder="Your Email Address" required />
        <br />
        <input type="password" onBlur={handleBlur} name="password" placeholder="Enter your password" required />
        <br />
        <input type="submit" value={newUser ? 'Sign up' : 'Sign In'} />
      </form>
      <p style={{ color: 'red' }}>{user.error}</p>
      {
        user.success && <p style={{ color: 'green' }}>User {newUser ? 'Created' : 'logged In'} Successfully </p>
      }
    </div>
  );
}

export default App;
