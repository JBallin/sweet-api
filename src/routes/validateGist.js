const express = require('express');
const { isValidGist } = require('../api/gist');

const router = express.Router();

router.get('/:gistId', async (req, res) => {
  const { gistId } = req.params;
  const isValid = await isValidGist(gistId);
  res.json({ isValid });
});

module.exports = router;