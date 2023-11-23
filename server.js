const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
  
app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'), { 
      headers: { 'Content-Type': 'text/javascript' } 
    });
  });
  
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
