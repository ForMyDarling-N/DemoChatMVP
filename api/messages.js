// Simpan data di memory (sementara)
// Untuk production, bisa ganti dengan database
let messages = [];
let users = {};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;

  try {
    // GET - Ambil semua pesan
    if (method === 'GET') {
      return res.status(200).json({
        success: true,
        data: messages,
        users: users
      });
    }

    // POST - Kirim pesan baru
    if (method === 'POST') {
      const { text, username, userId } = await req.body;
      
      if (!text || !username) {
        return res.status(400).json({
          success: false,
          message: 'Text dan username diperlukan'
        });
      }

      // Simpan user data
      if (!users[userId]) {
        users[userId] = {
          id: userId,
          username: username,
          joinedAt: new Date().toISOString()
        };
      }

      const newMessage = {
        id: Date.now().toString(),
        text,
        username,
        userId,
        timestamp: new Date().toISOString(),
        likes: 0
      };

      messages.push(newMessage);
      
      return res.status(201).json({
        success: true,
        message: 'Pesan berhasil dikirim',
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
