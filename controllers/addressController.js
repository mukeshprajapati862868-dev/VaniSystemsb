const Address = require('../models/Address');

/**
 * @desc    Get user's addresses
 * @route   GET /api/addresses
 * @access  Private
 */
exports.getAllAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.id }).sort({ isDefault: -1 });

    res.status(200).json({
      success: true,
      data: { addresses }
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Add new address
 * @route   POST /api/addresses
 * @access  Private
 */
exports.createAddress = async (req, res) => {
  try {
    const { type, fullName, phone, pincode, address, city, state, isDefault } = req.body;

    // If setting as default, unset all others first
    if (isDefault) {
      await Address.updateMany({ userId: req.user.id }, { isDefault: false });
    }

    const newAddress = await Address.create({
      userId: req.user.id,
      type,
      fullName,
      phone,
      pincode,
      address,
      city,
      state,
      isDefault: isDefault || false
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { address: newAddress }
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Update address
 * @route   PUT /api/addresses/:id
 * @access  Private
 */
exports.updateAddress = async (req, res) => {
  try {
    // Find by _id AND userId together — ownership check is baked into the query
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!address) {
      // Either doesn't exist or belongs to a different user
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    const { type, fullName, phone, pincode, address: addr, city, state, isDefault } = req.body;

    // If setting as default, unset all others for this user first
    if (isDefault) {
      await Address.updateMany(
        { userId: req.user.id, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }

    if (type !== undefined)      address.type      = type;
    if (fullName !== undefined)  address.fullName  = fullName;
    if (phone !== undefined)     address.phone     = phone;
    if (pincode !== undefined)   address.pincode   = pincode;
    if (addr !== undefined)      address.address   = addr;
    if (city !== undefined)      address.city      = city;
    if (state !== undefined)     address.state     = state;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await address.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: { address }
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Delete address
 * @route   DELETE /api/addresses/:id
 * @access  Private
 */
exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    await Address.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    Set address as default
 * @route   POST /api/addresses/:id/set-default
 * @access  Private
 */
exports.setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    await Address.updateMany({ userId: req.user.id }, { isDefault: false });
    address.isDefault = true;
    await address.save();

    res.status(200).json({
      success: true,
      message: 'Default address updated',
      data: { address }
    });
  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
