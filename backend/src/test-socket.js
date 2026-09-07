const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:5000';

async function runTest() {
  console.log('--- Starting Backend & Socket.io Verification ---');

  const clientAlice = io(SERVER_URL, { reconnection: false, transports: ['websocket'] });
  const clientBob = io(SERVER_URL, { reconnection: false, transports: ['websocket'] });

  let aliceJoined = false;
  let bobJoined = false;
  let messageReceived = false;
  let typingReceived = false;
  let onlineUsersVerified = false;

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Test timed out after 15 seconds!'));
    }, 15000);

    const checkComplete = () => {
      if (aliceJoined && bobJoined && messageReceived && typingReceived && onlineUsersVerified) {
        clearTimeout(timeout);
        resolve();
      }
    };

    clientAlice.on('connect', () => {
      console.log('✔ Alice connected to socket');
      clientAlice.emit('joinRoom', {
        room: 'general',
        user: { username: 'Alice', avatarColor: '#4F46E5', isGuest: false }
      });
    });

    clientBob.on('connect', () => {
      console.log('✔ Bob connected to socket');
      clientBob.emit('joinRoom', {
        room: 'general',
        user: { username: 'Bob', avatarColor: '#059669', isGuest: true }
      });
    });

    clientAlice.on('roomHistory', (data) => {
      console.log(`✔ Alice received room history for #${data.room} (${data.messages.length} messages)`);
      aliceJoined = true;
      checkComplete();
    });

    clientBob.on('roomHistory', (data) => {
      console.log(`✔ Bob received room history for #${data.room}`);
      bobJoined = true;

      // Alice sends message to Bob
      setTimeout(() => {
        clientAlice.emit('chatMessage', {
          room: 'general',
          sender: { username: 'Alice', avatarColor: '#4F46E5', isGuest: false },
          text: 'Hello Bob, testing real-time socket delivery!'
        });

        // Alice sends typing indicator
        clientAlice.emit('typing', {
          room: 'general',
          username: 'Alice',
          isTyping: true
        });
      }, 500);

      checkComplete();
    });

    clientBob.on('chatMessage', (msg) => {
      if (msg.sender.username === 'Alice' && msg.text.includes('testing real-time')) {
        console.log(`✔ Bob received Alice's message: "${msg.text}"`);
        messageReceived = true;
        checkComplete();
      }
    });

    clientBob.on('typing', (data) => {
      if (data.username === 'Alice' && data.isTyping) {
        console.log('✔ Bob received Alice typing indicator');
        typingReceived = true;
        checkComplete();
      }
    });

    clientBob.on('onlineUsers', (users) => {
      const names = users.map((u) => u.username);
      console.log(`✔ Online users in room: [${names.join(', ')}]`);
      if (names.includes('Alice') && names.includes('Bob')) {
        onlineUsersVerified = true;
        checkComplete();
      }
    });

    clientAlice.on('connect_error', (err) => {
      console.error('Alice connect error:', err.message);
    });

    clientBob.on('connect_error', (err) => {
      console.error('Bob connect error:', err.message);
    });
  });

  console.log('--- All Socket.io and Room Tests Passed Successfully! ---');
  clientAlice.disconnect();
  clientBob.disconnect();
  process.exit(0);
}

runTest().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
