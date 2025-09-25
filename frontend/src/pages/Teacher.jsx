import React, { useState, useEffect } from 'react';
import socket from '../socket';

export default function Teacher() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['','']);
  const [activePoll, setActivePoll] = useState(null);

  useEffect(()=>{
    socket.on('pollStarted', p => setActivePoll(p));
    socket.on('pollUpdated', p => setActivePoll(p));
    socket.on('pollEnded', () => setActivePoll(null));
    return ()=> {
      socket.off('pollStarted'); socket.off('pollUpdated'); socket.off('pollEnded');
    };
  },[]);

  const addOption = () => setOptions([...options, '']);
  const setOpt = (i,v) => { const copy=[...options]; copy[i]=v; setOptions(copy); };

  const createPoll = () => {
    const cleaned = options.map(o => o.trim()).filter(Boolean);
    if (!question.trim() || cleaned.length < 2) return alert('Add question and at least 2 options');
    socket.emit('createPoll', { question, options: cleaned });
    setQuestion(''); setOptions(['','']);
  };

  const endPoll = () => {
    if (!activePoll) return;
    socket.emit('endPoll', { pollId: activePoll._id });
  };

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      <div>
        <input placeholder="Question" value={question} onChange={e=>setQuestion(e.target.value)} />
        {options.map((o,i)=>(
          <input key={i} value={o} onChange={e=>setOpt(i,e.target.value)} placeholder={`Option ${i+1}`} />
        ))}
        <button onClick={addOption}>Add option</button>
        <button onClick={createPoll}>Start Poll</button>
      </div>

      <hr/>

      <h2>Active Poll</h2>
      {!activePoll ? <p>No active poll</p> : (
        <div>
          <h3>{activePoll.question}</h3>
          <ul>
            {activePoll.options.map(opt=>(
              <li key={opt.id}>{opt.text} — {opt.votes}</li>
            ))}
          </ul>
          <button onClick={endPoll}>End Poll</button>
        </div>
      )}
    </div>
  );
}
