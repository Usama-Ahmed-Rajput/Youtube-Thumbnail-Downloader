// Initialize theme from local storage
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add("dark");
    }

    function toggleTheme() {
      document.body.classList.toggle("dark");
      localStorage.setItem('darkMode', document.body.classList.contains("dark"));
    }

    function isValidYouTubeUrl(url) {
      const patterns = [
        /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=([^&]+)/,
        /^(https?:\/\/)?(www\.)?youtu\.be\/([^&]+)/,
        /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/([^&]+)/,
        /^(https?:\/\/)?(www\.)?youtube\.com\/v\/([^&]+)/,
        /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/([^&]+)/
      ];
      return patterns.some(pattern => pattern.test(url));
    }

    async function checkImage(url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    }

    async function getThumbnail() {
      const url = document.getElementById('videoUrl').value;
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = "<div class='loading-spinner'></div>";

      if (!isValidYouTubeUrl(url)) {
        resultDiv.innerHTML = "<p>❌ Please enter a valid YouTube URL</p>";
        return;
      }

      const videoId = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)[1];
      const qualities = [
        { url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, label: "Maximum Resolution (1280x720)" },
        { url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`, label: "Standard Definition (640x480)" },
        { url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, label: "High Quality (480x360)" },
        { url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, label: "Medium Quality (320x180)" },
        { url: `https://img.youtube.com/vi/${videoId}/default.jpg`, label: "Default Quality (120x90)" }
      ];

      let finalURL = '';
      let qualityLabel = '';
      
      for (const quality of qualities) {
        const isAvailable = await checkImage(quality.url);
        if (isAvailable) {
          finalURL = quality.url;
          qualityLabel = quality.label;
          break;
        }
      }

      if (!finalURL) {
        resultDiv.innerHTML = "<p>❌ Could not retrieve thumbnail for this video</p>";
        return;
      }

      const img = document.createElement("img");
      img.src = finalURL;
      img.className = "thumbnail";
      img.onerror = function() {
        this.style.display = "none";
        qualityInfo.textContent = "❌ Thumbnail not available for this video";
        downloadBtn.style.display = "none";
        copyBtn.style.display = "none";
      };

      const qualityInfo = document.createElement("p");
      qualityInfo.className = "quality-info";
      qualityInfo.textContent = `🧪 Thumbnail quality: ${qualityLabel}`;

      const downloadBtn = document.createElement("button");
      downloadBtn.className = "download-link";
      downloadBtn.textContent = "⬇ Download Thumbnail";
      downloadBtn.onclick = async function() {
        downloadBtn.textContent = "⏳ Downloading...";
        downloadBtn.disabled = true;
        try {
          await downloadImage(finalURL, `${videoId}-thumbnail.jpg`);
        } catch (error) {
          alert("Failed to download thumbnail. Please try again.");
        }
        downloadBtn.textContent = "⬇ Download Thumbnail";
        downloadBtn.disabled = false;
      };

      const copyBtn = document.createElement("button");
      copyBtn.textContent = "📋 Copy URL";
      copyBtn.className = "download-link";
      copyBtn.onclick = copyThumbnailUrl;

      resultDiv.innerHTML = "";
      resultDiv.appendChild(img);
      resultDiv.appendChild(qualityInfo);
      resultDiv.appendChild(downloadBtn);
      resultDiv.appendChild(copyBtn);
    }

    async function downloadImage(url, filename) {
      try {
        // Fetch the image as a blob
        const response = await fetch(url);
        const blob = await response.blob();
        
        // Create a local URL for the blob
        const blobUrl = URL.createObjectURL(blob);
        
        // Create a temporary anchor element
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        }, 100);
      } catch (error) {
        console.error('Download error:', error);
        throw error;
      }
    }

    function copyThumbnailUrl() {
      const img = document.querySelector('.thumbnail');
      if (!img) return;
      
      navigator.clipboard.writeText(img.src)
        .then(() => alert('Thumbnail URL copied to clipboard!'))
        .catch(err => console.error('Failed to copy: ', err));
    }

    function clearInput() {
      document.getElementById('videoUrl').value = '';
      document.getElementById('result').innerHTML = '';
    }

    function showPopup() {
      if (!sessionStorage.getItem('popupShown')) {
        document.getElementById("popup").style.display = "block";
        sessionStorage.setItem('popupShown', 'true');
      }
    }

    function closePopup() {
      document.getElementById("popup").style.display = "none";
    }

    // Handle Enter key press
    document.getElementById('videoUrl').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        getThumbnail();
      }
    });

    // Show popup after 5 seconds
    setTimeout(showPopup, 5000);
