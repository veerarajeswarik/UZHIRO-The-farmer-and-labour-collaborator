const asyncHandler = require('express-async-handler');
const Product = require('../../models/Product');
const { sendSuccess, sendError } = require('../../utils/apiResponse');

const ALLOWED_FIELDS = ['name', 'category', 'crop', 'description', 'unit', 'estimatedPrice', 'seller', 'purchaseUrl', 'source'];

function pickFields(body) {
  const out = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) out[field] = body[field];
  }
  return out;
}

// GET /api/admin/products
const listProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().populate('crop', 'name').sort({ category: 1, name: 1 });
  sendSuccess(res, 200, { products, count: products.length });
});

// POST /api/admin/products
const createProduct = asyncHandler(async (req, res) => {
  const fields = pickFields(req.body);
  // Admin-entered products are real data the admin is vouching for - mark accordingly, distinct from the seeded example catalog.
  const product = await Product.create({
    ...fields,
    crop: fields.crop || null,
    isExampleData: false,
    source: fields.source || 'Manually entered by admin.',
    lastUpdated: new Date(),
  });
  sendSuccess(res, 201, { product });
});

// PUT /api/admin/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const fields = pickFields(req.body);
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: { ...fields, lastUpdated: new Date() } },
    { new: true, runValidators: true }
  );
  if (!product) return sendError(res, 404, 'Product not found.');
  sendSuccess(res, 200, { product });
});

// DELETE /api/admin/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return sendError(res, 404, 'Product not found.');
  sendSuccess(res, 200, { deleted: true });
});

module.exports = { listProducts, createProduct, updateProduct, deleteProduct };
