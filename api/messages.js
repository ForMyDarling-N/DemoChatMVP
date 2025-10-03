let messages = [];
let users = {};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Ambil pesan
    if (req.method === 'GET') {
      return res.json({
        success: true,
        data: messages,
        users: users
      });
    }

    // POST - Kirim pesan
    if (req.method === 'POST') {
      const body = await readBody(req);
      const { text, username, userId } = body;
      
      if (!text) {
        return res.status(400).json({ error: 'Text required' });
      }

      const newMessage = {
        id: Date.now().toString(),
        text,
        username: username || 'Anonymous',
        userId: userId || 'user_unknown',
        timestamp: new Date().toISOString(),
        likes: 0
      };

      messages.push(newMessage);
      
      // Simpan user
      if (userId && !users[userId]) {
        users[userId] = { id: userId, username: username || 'Anonymous' };
      }

      return res.json({ success: true, data: newMessage });
    }

    // PUT - Like atau edit
    if (req.method === 'PUT') {
      const body = await readBody(req);
      const { action, messageId, newText, userId, newUsername } = body;

      if (action === 'like' && messageId) {
        const msg = messages.find(m => m.id === messageId);
        if (msg) {
          msg.likes = (msg.likes || 0) + 1;
          return res.json({ success: true, likes: msg.likes });
        }
      }

      if (action === 'editMessage' && messageId && newText) {
        const msg = messages.find(m => m.id === messageId);
        if (msg) {
          msg.text = newText;
          msg.edited = true;
          return res.json({ success: true, data: msg });
        }
      }

      if (action === 'updateProfile' && userId && newUsername) {
        if (users[userId]) {
          users[userId].username = newUsername;
          // Update semua pesan user ini
          messages.forEach(msg => {
            if (msg.userId === userId) msg.username = newUsername;
          });
          return res.json({ success: true, user: users[userId] });
        }
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Helper function untuk membaca body
function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
                         }        message: 'Pesan berhasil dikirim',
        data: newMessage
      });
    }

    // PUT - Edit pesan atau profile
    if (method === 'PUT') {
      const { action, messageId, newText, userId, newUsername } = await req.body;

      if (action === 'editMessage' && messageId && newText) {
        const messageIndex = messages.findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
          messages[messageIndex].text = newText;
          messages[messageIndex].edited = true;
          
          return res.status(200).json({
            success: true,
            data: messages[messageIndex]
          });
        }
      }

      if (action === 'updateProfile' && userId && newUsername) {
        if (users[userId]) {
          users[userId].username = newUsername;
          
          // Update username di semua pesan user tersebut
          messages.forEach(msg => {
            if (msg.userId === userId) {
              msg.username = newUsername;
            }
          });
          
          return res.status(200).json({
            success: true,
            user: users[userId]
          });
        }
      }

      if (action === 'like' && messageId) {
        const messageIndex = messages.findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
          messages[messageIndex].likes = (messages[messageIndex].likes || 0) + 1;
          
          return res.status(200).json({
            success: true,
            likes: messages[messageIndex].likes
          });
        }
      }

      return res.status(400).json({
        success: false,
        message: 'Aksi tidak valid'
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method tidak diizinkan'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
    }
