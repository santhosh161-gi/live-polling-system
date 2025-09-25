import React, { useState, useEffect } from 'react';
import socket from '../socket';
import { nanoid } from 'nanoid';

export default function Student() {
  const [poll, setPoll] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState(localStorage.getItem('studentId') || '');
  const [answered, setAnswered] = useState(false);

  useEffect(()=>{
    // ensure studentId
    if (!studentId) {
      const id = nanoid(10);
      localStorage.setItem('studentId', id);
      setStudentId(id);
    }

    socket.on('pollStarted', p => { setPoll(p); setAnswered(false); });
    socket.on('pollUpdated', p => setPoll(p));
    socket.on('pollEnded', ()=> setPoll(null));
    socket.on('alreadyAnswered', ()=> setAnswered(true));

    // initial active poll fetch (optional)
    fetch('/api/polls/active').then(r=>r.json()).then(p=>{
      if (p) setPoll(p);
    }).catch(()=>{});
    return ()=> { socket.off('pollStarted'); socket.off('pollUpdated'); socket.off('pollEnded'); }
  },[studentId]);

  const submit = (optionId) => {
    if (!studentName.trim()) {
      const name = prompt('Please enter your name (display)');
      if (!name) return;
      setStudentName(name);
    }
    socket.emit('submitAnswer', { pollId: poll._id, optionId, studentId });
    setAnswered(true);
  };

  if (!poll) return <div><h2>No active poll</h2></div>;

  return (
    <div>
      <h2>{poll.question}</h2>
      {answered ? (
        <ul>
          {poll.options.map(o => <li key={o.id}>{o.text} — {o.votes}</li>)}
        </ul>
      ) : (
        poll.options.map(o =>
          <button key={o.id} onClick={()=>submit(o.id)}>{o.text}</button>
        )
      )}
    </div>
  );
}

