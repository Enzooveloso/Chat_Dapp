import React, { useState, useEffect } from 'react';
import { chat_backend } from 'declarations/chat_backend';
import { Principal } from '@dfinity/principal';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [text, setText] = useState('');
  const [userPrincipal, setUserPrincipal] = useState('');

  
  useEffect(() => {
    const connectPlug = async () => {
      try {
        if (!window.ic?.plug) {
          alert("Plug Wallet não está instalada.");
          return;
        }

        const connected = await window.ic.plug.isConnected();
        if (!connected) {
          await window.ic.plug.requestConnect({
            whitelist: [process.env.CANISTER_ID_CHAT_BACKEND],
            host: process.env.DFX_NETWORK === 'ic' ? 'https://mainnet.dfinity.network' : 'http://localhost:4943'
          });
        }

        const principal = await window.ic.plug.agent.getPrincipal();
        setUserPrincipal(principal.toText());
      } catch (err) {
        console.error("Erro ao conectar Plug Wallet:", err);
      }
    };

    connectPlug();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [recipient]);

  const fetchMessages = async () => {
    try {
      if (recipient === '') return;
      const principal = Principal.fromText(recipient);
      const result = await chat_backend.getMessages(principal);
      setMessages(result);
    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
    }
  };

  const sendMessage = async () => {
    try {
      if (recipient === '' || text === '') return;
      const principal = Principal.fromText(recipient);
      await chat_backend.sendMessage(principal, text);
      setText('');
      await fetchMessages();
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  return (
    <div>
      <h2>Chat em Rede</h2>

      <p><strong>Conectado como:</strong> {userPrincipal || 'Não conectado'}</p>

      <input
        placeholder="Principal do destinatário"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <br />

      <textarea
        placeholder="Digite sua mensagem"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <br />

      <button onClick={sendMessage}>Enviar</button>

      <div>
        <h3>Mensagens</h3>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <strong>{msg.from.toText()}</strong>: {msg.text} <br />
              <small>{new Date(Number(msg.timestamp) / 1_000_000).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Chat;
