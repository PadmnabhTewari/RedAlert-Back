const Staff = require('../models/Staff');

exports.getStaff = async (req, res) => {
  try {
    const { shift } = req.query; // Get shift filter from query params
    const staff = await Staff.findAll(shift); // Pass shift filter to model
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: 'Failed to fetch staff members' });
  }
};

exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff member:', error);
    res.status(500).json({ error: 'Failed to fetch staff member' });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const { Name, Designation, Contact, Email, Station_ID, Shift, Shift_Date } = req.body;

    // Validate required fields
    if (!Name || !Designation || !Contact || !Email || !Station_ID || !Shift || !Shift_Date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate shift value
    const validShifts = ['Morning', 'Evening', 'Night'];
    if (!validShifts.includes(Shift)) {
      return res.status(400).json({ error: 'Invalid shift value. Must be one of: Morning, Evening, Night' });
    }

    const staffId = await Staff.create(req.body);
    const staff = await Staff.findById(staffId);
    res.status(201).json(staff);
  } catch (error) {
    console.error('Error creating staff:', error);
    if (error.message.includes('Invalid Station_ID')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create staff member' });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { Name, Designation, Contact, Email, Station_ID, Shift, Shift_Date } = req.body;

    // Validate required fields
    if (!Name || !Designation || !Contact || !Email || !Station_ID || !Shift || !Shift_Date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate shift value
    const validShifts = ['Morning', 'Evening', 'Night'];
    if (!validShifts.includes(Shift)) {
      return res.status(400).json({ error: 'Invalid shift value. Must be one of: Morning, Evening, Night' });
    }

    const success = await Staff.update(req.params.id, req.body);
    if (!success) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    const staff = await Staff.findById(req.params.id);
    res.json(staff);
  } catch (error) {
    console.error('Error updating staff:', error);
    if (error.message.includes('Invalid Station_ID')) {
      return res.status(400).json({ error: error.message });
    }
    if (error.message.includes('Staff member not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update staff member' });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const success = await Staff.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Staff member not found' });
    }
    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    if (error.message.includes('Staff member not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
};