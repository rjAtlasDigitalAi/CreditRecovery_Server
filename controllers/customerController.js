const Customer = require("../models/Customer");

// GET all customers
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};



// const Customer = require("../models/Customer");

// ✅ Create Customer (Import)
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, totalCredit, paid, balance, dueDate, status } =
      req.body;

    const newCustomer = new Customer({
      name,
      phone,
      totalCredit,
      paid,
      balance,
      dueDate,
      status,
    });

    await newCustomer.save();

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: newCustomer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating customer",
      error: error.message,
    });
  }
};



// ✅ Get Single Customer
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching customer",
      error: error.message,
    });
  }
};

// ✅ Update Customer
exports.updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      message: "Customer updated",
      data: updatedCustomer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating customer",
      error: error.message,
    });
  }
};

// ✅ Delete Customer
exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Customer deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting customer",
      error: error.message,
    });
  }
};