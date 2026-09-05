const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/store_reviews.json');

function loadReviews() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify({}), 'utf-8');
      return {};
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '{}');
  } catch (err) {
    console.error('Error loading store reviews:', err);
    return {};
  }
}

function saveReviews(data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store reviews:', err);
  }
}

function getReview(userId, storeId) {
  if (!userId || !storeId) return null;
  const reviews = loadReviews();
  const key = `${userId}_${storeId}`;
  return reviews[key] || null;
}

function setReview(userId, storeId, experienceText) {
  if (!userId || !storeId) return;
  const reviews = loadReviews();
  const key = `${userId}_${storeId}`;
  reviews[key] = {
    experience: (experienceText || '').trim(),
    updatedAt: new Date().toISOString()
  };
  saveReviews(reviews);
}

function deleteReview(userId, storeId) {
  if (!userId || !storeId) return;
  const reviews = loadReviews();
  const key = `${userId}_${storeId}`;
  if (reviews[key]) {
    delete reviews[key];
    saveReviews(reviews);
  }
}

module.exports = {
  getReview,
  setReview,
  deleteReview,
  loadReviews,
};
