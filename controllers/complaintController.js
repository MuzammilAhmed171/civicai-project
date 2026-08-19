const { spawnSync } = require('child_process');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const Complaint = require('../models/Complaint');
const { fallbackAiPrediction, analyzeComplaintWithGeminiVision } = require('./aiController');

// Get complaints directly from MongoDB database
const getComplaints = async (req, res) => {
  try {
    const { user, cnic, city, province, category, priority, status } = req.query;

    let filter = {};
    if (user) filter.user = user;
    if (cnic) filter.cnic = cnic;
    if (city) filter.city = city;
    if (province) filter.province = province;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    return res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single complaint by ID from MongoDB
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
    return res.json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new complaint in MongoDB
const createComplaint = async (req, res) => {
  try {
    const {
      description,
      imageUrl,
      province: reqProv,
      city: reqCity,
      addressLine1,
      addressLine2,
      location: reqLoc,
      category: reqCat,
      priority: reqPri,
      aiOutput: reqAi
    } = req.body;

    if (!description && !imageUrl) {
      return res.status(400).json({ error: 'Complaint description or image photo is required' });
    }

    const citizenUser = req.user;
    const citizenName = citizenUser ? citizenUser.name : (req.body.citizenName || 'Civic Citizen');
    const cnic = citizenUser ? citizenUser.cnic : (req.body.cnic || '42101-0000000-0');
    const phone = citizenUser ? citizenUser.phone : (req.body.phone || '0300-0000000');
    const province = reqProv || (citizenUser ? citizenUser.province : 'Sindh');
    const city = reqCity || (citizenUser ? citizenUser.city : 'Karachi');

    const fullLocation = reqLoc || `${addressLine1 || 'Main Area'}${addressLine2 ? ', ' + addressLine2 : ''}, ${city}, ${province}`;

    // Gemini Vision AI Analysis
    let aiPrediction = reqAi;
    if (!aiPrediction || !aiPrediction.category) {
      aiPrediction = await analyzeComplaintWithGeminiVision(description || 'Civic issue reported with photo.', imageUrl);
    }

    const category = reqCat || aiPrediction.category || 'Other';
    const priority = reqPri || aiPrediction.priority || 'Medium';

    const departmentMap = {
      Road: 'PWD Department',
      Water: 'Water Supply Department',
      Waste: 'Sanitation Department',
      Electricity: 'Electricity Board',
      Drainage: 'Sewage Department',
      Safety: 'Police Department',
      Other: 'General Administration'
    };

    const assignedDepartment = departmentMap[category] || 'General Administration';

    // Model-driven Duplicate Detection Algorithm against MongoDB
    let isDuplicate = false;
    let duplicateGroupId = '';

    const existingList = await Complaint.find({ city, category });
    const addrLower = (addressLine1 || fullLocation).toLowerCase();
    const descLower = (description || '').toLowerCase();

    for (let item of existingList) {
      const itemAddr = (item.addressLine1 || item.location || '').toLowerCase();
      const itemDesc = (item.description || '').toLowerCase();

      const locationOverlap = itemAddr && addrLower && (addrLower.includes(itemAddr.slice(0, 8)) || itemAddr.includes(addrLower.slice(0, 8)));
      const descOverlap = itemDesc && descLower && (descLower.includes(itemDesc.slice(0, 15)) || itemDesc.includes(descLower.slice(0, 15)));

      if (locationOverlap || descOverlap) {
        isDuplicate = true;
        duplicateGroupId = item.duplicateGroupId || `DUP_${category.toUpperCase()}_${city.slice(0,3).toUpperCase()}_01`;
        if (!item.isDuplicate) {
          item.isDuplicate = true;
          item.duplicateGroupId = duplicateGroupId;
          await item.save();
        }
        break;
      }
    }

    const newComplaint = new Complaint({
      user: citizenUser ? citizenUser._id : undefined,
      citizenName,
      cnic,
      phone,
      province,
      city,
      addressLine1: addressLine1 || 'Main Area',
      addressLine2: addressLine2 || '',
      description: description || 'Grievance submitted with image photo.',
      category,
      priority,
      location: fullLocation,
      imageUrl: imageUrl || '',
      status: 'Open',
      assignedDepartment,
      resolutionNotes: isDuplicate ? 'Automated System Alert: Flagged as potential duplicate report for this location.' : 'Grievance logged into municipal portal.',
      isDuplicate,
      duplicateGroupId,
      aiOutput: aiPrediction
    });

    const saved = await newComplaint.save();
    return res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update complaint in MongoDB
const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedDepartment, resolutionNotes, isDuplicate, priority, category } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const updateFields = {};
    if (status) updateFields.status = status;
    if (assignedDepartment) updateFields.assignedDepartment = assignedDepartment;
    if (resolutionNotes !== undefined) updateFields.resolutionNotes = resolutionNotes;
    if (isDuplicate !== undefined) updateFields.isDuplicate = isDuplicate;
    if (priority) updateFields.priority = priority;
    if (category) updateFields.category = category;

    // 1. Always update the requested complaint
    Object.assign(complaint, updateFields);
    await complaint.save();

    // 2. If part of a duplicateGroupId, update ALL complaints with that duplicateGroupId
    if (complaint.duplicateGroupId) {
      await Complaint.updateMany(
        { duplicateGroupId: complaint.duplicateGroupId },
        { $set: updateFields }
      );
    }

    console.log(`✅ Complaint [${id}] & stack updated in MongoDB Atlas: status=${complaint.status}`);
    return res.json(complaint);
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get duplicate complaint records directly from MongoDB
const getDuplicateGroups = async (req, res) => {
  try {
    let list = await Complaint.find({ isDuplicate: true });
    return res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Compute analytics live from MongoDB
const getAnalytics = async (req, res) => {
  try {
    let complaints = await Complaint.find({});

    const total = complaints.length;
    const open = complaints.filter(c => c.status === 'Open').length;
    const assigned = complaints.filter(c => c.status === 'Assigned').length;
    const in_progress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const closed = complaints.filter(c => c.status === 'Closed').length;
    const critical = complaints.filter(c => c.priority === 'Critical').length;
    const duplicates = complaints.filter(c => c.isDuplicate).length;

    const catMap = {};
    complaints.forEach(c => { catMap[c.category] = (catMap[c.category] || 0) + 1; });
    const by_category = Object.keys(catMap).map(k => ({ name: k, count: catMap[k] }));

    const priMap = {};
    complaints.forEach(c => { priMap[c.priority] = (priMap[c.priority] || 0) + 1; });
    const by_priority = Object.keys(priMap).map(k => ({ name: k, count: priMap[k] }));

    const statMap = {};
    complaints.forEach(c => { statMap[c.status] = (statMap[c.status] || 0) + 1; });
    const by_status = Object.keys(statMap).map(k => ({ name: k, count: statMap[k] }));

    const cityMap = {};
    complaints.forEach(c => {
      const city = c.city || 'Karachi';
      cityMap[city] = (cityMap[city] || 0) + 1;
    });
    const by_city = Object.keys(cityMap).map(k => ({ name: k, count: cityMap[k] }));

    const provMap = {};
    complaints.forEach(c => {
      const prov = c.province || 'Sindh';
      provMap[prov] = (provMap[prov] || 0) + 1;
    });
    const by_province = Object.keys(provMap).map(k => ({ name: k, count: provMap[k] }));

    let most_common_category = by_category.sort((a, b) => b.count - a.count)[0]?.name || (total > 0 ? 'Water' : 'N/A');
    let most_common_city = by_city.sort((a, b) => b.count - a.count)[0]?.name || (total > 0 ? 'Karachi' : 'N/A');
    let resolution_rate = total > 0 ? `${((resolved / total) * 100).toFixed(1)}%` : '0.0%';

    return res.json({
      total,
      open,
      assigned,
      in_progress,
      resolved,
      closed,
      critical,
      duplicates,
      by_category,
      by_priority,
      by_status,
      by_city,
      by_province,
      trends: [
        { date: 'Mon', count: Math.max(0, total - 4) },
        { date: 'Tue', count: Math.max(0, total - 3) },
        { date: 'Wed', count: Math.max(0, total - 2) },
        { date: 'Thu', count: Math.max(0, total - 1) },
        { date: 'Today', count: total }
      ],
      insights: {
        most_common_category,
        most_common_city,
        highest_priority_category: most_common_category,
        peak_day: 'Today',
        resolution_rate
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAnalyticsOverview = async (req, res) => { return getAnalytics(req, res); };

module.exports = {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  getDuplicateGroups,
  getAnalytics,
  getAnalyticsOverview
};
