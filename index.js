const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = Math.floor(Math.random() * (9999 - 3000 + 1)) + 3000;

// Endpoint untuk API TikTok
app.get('/tiktok', async (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ error: 'Parameter "username" wajib diisi' });
  }

  try {
    const response = await axios.get(`https://www.tiktok.com/@${username}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(response.data);
    const scriptTag = $('#__UNIVERSAL_DATA_FOR_REHYDRATION__').html();

    if (!scriptTag) {
      return res.status(404).json({ error: 'Data pengguna tidak ditemukan' });
    }

    const jsonData = JSON.parse(scriptTag);
    const userData = jsonData['__DEFAULT_SCOPE__']['webapp.user-detail'];
    const userInfo = userData.userInfo.user;
    const stats = userData.userInfo.stats;

    res.json({
      status: "success",
      author: "ziddrestMyAPI",
      code: 200,
      data: {
        name: userInfo.nickname,
        username: userInfo.uniqueId,
        bio: userInfo.signature,
        avatar: userInfo.avatarLarger,
        id: userInfo.id,
        uniqueId: userInfo.uniqueId,
        language: userInfo.language,
        verified: userInfo.verified ? "Verified" : "Unverified",
        is_private: userInfo.privateAccount ? "Private" : "Public",
        followers: stats.followerCount,
        following: stats.followingCount,
        likes: stats.heartCount,
        videos: stats.videoCount
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil data TikTok' });
  }
});

// Endpoint untuk halaman HTML
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>TikTok Stalker</title>
      <link rel="icon" type="image/x-icon" href="https://raw.githubusercontent.com/Fry-Bansee139/tiktokstalker/refs/heads/main/IMG_20250510_134540.jpg">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
      <style>
        body {
          background-color: #fceff9;
          font-family: 'Segoe UI', sans-serif;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .container {
          flex: 1;
        }
        .result-box {
          background-color: #d0e7ff;
          padding: 20px;
          border-radius: 10px;
          margin-top: 20px;
          text-align: left;
          display: none;
        }
        .footer {
          text-align: center;
          padding: 15px;
          font-size: 0.9rem;
          color: #888;
          background-color: transparent;
        }

        .footer a {
          color: #888;
          text-decoration: none;
      
        }

        .footer a:hover {
          text-decoration: underline;
        }
        .avatar {
          max-width: 100px;
          border-radius: 50%;
        }
        .error-text {
          color: red;
          font-weight: bold;
        }
        
      </style>
    </head>
    <body>
      <div class="container text-center py-5">
        <h1 class="mb-4">TikTok Stalker</h1>
        <p>Masukkan username TikTok untuk melihat info pengguna</p>
        <form onsubmit="stalkTikTok(); return false;" class="mb-3">
          <input type="text" class="form-control form-control-lg mb-3" id="nameInput" placeholder="Contoh: mrbeast" />
          <button class="btn btn-primary btn-lg" type="submit">Cek Sekarang!</button>
        </form>

        <div id="resultBox" class="result-box">
          <div id="errorMsg" class="error-text mb-3"></div>
          <div id="userInfo" style="display: none;">
            <img id="avatar" class="avatar mb-3" src="" alt="Avatar" />
            <h4 id="nickname"></h4>
            <p><strong>Username:</strong> <span id="username"></span></p>
            <p><strong>Bio:</strong> <span id="bio"></span></p>
            <p><strong>ID:</strong> <span id="id"></span></p>
            <p><strong>UniqueId:</strong> <span id="uniqueId"></span></p>
            <p><strong>Followers:</strong> <span id="followers"></span></p>
            <p><strong>Following:</strong> <span id="following"></span></p>
            <p><strong>Language:</strong> <span id="language"></span></p>
            <p><strong>Verified:</strong> <span id="verified"></span></p>
            <p><strong>Private/Public:</strong> <span id="is_private"></span></p>
            <p><strong>Likes:</strong> <span id="likes"></span></p>
            <p><strong>Videos:</strong> <span id="videos"></span></p>
          </div>
        </div>
      </div>
      <div class="footer">
              <p>Dibuat oleh
                <a href="https://instagram.com/zdybladeits" target="_blank">
                <i class="fab fa-instagram"></i>zdybladeits
              </p>
                </a>
              <p>“Prestasimu, adalah motivasi tujuanku dan pencapaianku”</p>
              <p>10 Mei ©2025</p>
              </div>
      <script>
        async function stalkTikTok() {
          const username = document.getElementById("nameInput").value.trim();
          const resultBox = document.getElementById("resultBox");
          const userInfo = document.getElementById("userInfo");
          const errorMsg = document.getElementById("errorMsg");

          if (!username) {
            resultBox.style.display = "block";
            userInfo.style.display = "none";
            errorMsg.innerText = "Masukkan username terlebih dahulu.";
            return;
          }

          try {
            const response = await fetch(\`/tiktok?username=\${username}\`);
            const data = await response.json();

            if (data.error) {
              throw new Error(data.error);
            }

            document.getElementById("avatar").src = data.data.avatar;
            document.getElementById("nickname").textContent = data.data.name;
            document.getElementById("username").textContent = data.data.username;
            document.getElementById("bio").textContent = data.data.bio;
            document.getElementById("verified").textContent = data.data.verified;
            document.getElementById("id").textContent = data.data.id;
            document.getElementById("language").textContent = data.data.language;
            document.getElementById("is_private").textContent = data.data.is_private;
            document.getElementById("uniqueId").textContent = data.data.uniqueId;
            
            document.getElementById("followers").textContent = data.data.followers.toLocaleString();
            document.getElementById("following").textContent = data.data.following.toLocaleString();
            document.getElementById("likes").textContent = data.data.likes.toLocaleString();
            document.getElementById("videos").textContent = data.data.videos.toLocaleString();

            resultBox.style.display = "block";
            errorMsg.innerText = "";
            userInfo.style.display = "block";
          } catch (err) {
            resultBox.style.display = "block";
            userInfo.style.display = "none";
            errorMsg.innerText = "Gagal mengambil data atau username salah.";
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
