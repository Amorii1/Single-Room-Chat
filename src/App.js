import React, { useRef, useState } from 'react'
import './App.css'

import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import 'firebase/compat/analytics'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

firebase.initializeApp({
    apiKey: 'AIzaSyA5bn906D8UhOeZ8RlW-s1p_bT3i4reC0Y',
    authDomain: 'singe-room-chat.firebaseapp.com',
    projectId: 'singe-room-chat',
    storageBucket: 'singe-room-chat.appspot.com',
    messagingSenderId: '525229323900',
    appId: '1:525229323900:web:172f6944b024db4c63bbf9',
    measurementId: 'G-FRBP0GYXFT',
})

const auth = firebase.auth()
const firestore = firebase.firestore()
const analytics = firebase.analytics()

function App() {
    const [user] = useAuthState(auth)

    return (
        <div className="App">
            <header>
                <h1>Holla! 😎</h1>
                <SignOut />
            </header>

            <section>{user ? <ChatRoom /> : <SignIn />}</section>
        </div>
    )
}

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider()
        auth.signInWithPopup(provider)
    }

    return (
        <>
            <button className="sign-in" onClick={signInWithGoogle}>
                Get in with Google
            </button>
            <p>
                Do not violate the community guidelines or you will be banned
                for life!
            </p>
        </>
    )
}

function SignOut() {
    return (
        auth.currentUser && (
            <button className="sign-out" onClick={() => auth.signOut()}>
                Get Out!
            </button>
        )
    )
}

function ChatRoom() {
    const dummy = useRef()
    const messagesRef = firestore.collection('messages')
    const query = messagesRef.orderBy('createdAt').limit(25)

    const [messages] = useCollectionData(query, { idField: 'id' })

    const [formValue, setFormValue] = useState('')

    const sendMessage = async (e) => {
        e.preventDefault()

        const { uid, photoURL } = auth.currentUser

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL,
        })

        setFormValue('')
        dummy.current.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <>
            <main>
                {messages &&
                    messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}

                <span ref={dummy}></span>
            </main>

            <form onSubmit={sendMessage}>
                <input
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="say something nice or don't say anything"
                />

                <button type="submit" disabled={!formValue}>
                    BOOM 😁
                </button>
            </form>
        </>
    )
}

function ChatMessage(props) {
    const { text, uid, photoURL } = props.message

    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'

    return (
        <>
            <div className={`message ${messageClass}`}>
                <img
                    src={
                        'https://api.adorable.io/avatars/23/abott@adorable.png'
                    }
                />
                <p>{text}</p>
            </div>
        </>
    )
}

export default App
