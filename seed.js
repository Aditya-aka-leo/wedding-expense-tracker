const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Import models
const User = require('./models/User');
const Budget = require('./models/Budget');
const Task = require('./models/Task');
const Expense = require('./models/Expense');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await User.deleteMany();
    await Budget.deleteMany();
    await Task.deleteMany();
    await Expense.deleteMany();
    console.log('✅ Cleared existing data');

    // Create Admin User
    const adminPinHash = await bcrypt.hash('1234', 10);
    const admin = await User.create({
      mobile: '9876543210',
      pinHash: adminPinHash,
      role: 'admin',
    });
    console.log('✅ Created admin user (Mobile: 9876543210, PIN: 1234)');

    // Create Regular Users
    const user1PinHash = await bcrypt.hash('5678', 10);
    const user1 = await User.create({
      mobile: '9876543211',
      pinHash: user1PinHash,
      role: 'user',
    });

    const user2PinHash = await bcrypt.hash('9012', 10);
    const user2 = await User.create({
      mobile: '9876543212',
      pinHash: user2PinHash,
      role: 'user',
    });
    console.log('✅ Created 2 regular users');

    // Create Budget
    const budget = await Budget.create({
      totalBudget: 1000000,
      amountSpent: 0,
      remaining: 1000000,
      createdBy: admin._id,
    });
    console.log('✅ Created budget (₹10,00,000)');

    // Create Tasks
    const tasks = await Task.create([
      {
        name: 'Venue',
        estimatedCost: 200000,
        description: 'Wedding venue booking and setup',
        createdBy: admin._id,
      },
      {
        name: 'Catering',
        estimatedCost: 300000,
        description: 'Food and beverages for 500 guests',
        createdBy: admin._id,
      },
      {
        name: 'Photography',
        estimatedCost: 150000,
        description: 'Professional photography and videography',
        createdBy: admin._id,
      },
      {
        name: 'Outfits',
        estimatedCost: 200000,
        description: 'Bride and groom wedding outfits',
        createdBy: admin._id,
      },
      {
        name: 'Decor',
        estimatedCost: 150000,
        description: 'Venue decoration and lighting',
        createdBy: admin._id,
      },
    ]);
    console.log('✅ Created 5 tasks');

    // Create Sample Expenses
    const expenses = await Expense.create([
      // Approved expense by admin (auto-approved)
      {
        task: tasks[0]._id, // Venue
        description: 'Advance payment for venue booking',
        amount: 50000,
        date: new Date('2025-10-01'),
        submittedBy: admin._id,
        status: 'approved',
      },
      // Approved expense by user1
      {
        task: tasks[1]._id, // Catering
        description: 'Catering advance payment',
        amount: 100000,
        date: new Date('2025-10-02'),
        submittedBy: user1._id,
        status: 'approved',
      },
      // Approved expense by admin
      {
        task: tasks[3]._id, // Outfits
        description: "Bride's wedding dress",
        amount: 80000,
        date: new Date('2025-10-03'),
        submittedBy: admin._id,
        status: 'approved',
      },
      // Pending expense by user2
      {
        task: tasks[2]._id, // Photography
        description: 'Photographer booking fee',
        amount: 75000,
        date: new Date('2025-10-05'),
        submittedBy: user2._id,
        status: 'pending',
      },
      // Pending expense by user1
      {
        task: tasks[4]._id, // Decor
        description: 'Decoration advance',
        amount: 60000,
        date: new Date('2025-10-06'),
        submittedBy: user1._id,
        status: 'pending',
      },
    ]);
    console.log('✅ Created 5 sample expenses (3 approved, 2 pending)');

    // Update budget with approved expenses
    const approvedTotal = expenses
      .filter(exp => exp.status === 'approved')
      .reduce((sum, exp) => sum + exp.amount, 0);

    budget.amountSpent = approvedTotal;
    budget.remaining = budget.totalBudget - approvedTotal;
    await budget.save();
    console.log('✅ Updated budget with approved expenses');

    // Update task actual costs
    for (const task of tasks) {
      const taskExpenses = expenses.filter(
        exp => exp.task.toString() === task._id.toString() && exp.status === 'approved'
      );
      task.actualCost = taskExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      await task.save();
    }
    console.log('✅ Updated task actual costs');

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('----------------------------------------');
    console.log('Admin:');
    console.log('  Mobile: 9876543210');
    console.log('  PIN: 1234');
    console.log('\nUser 1:');
    console.log('  Mobile: 9876543211');
    console.log('  PIN: 5678');
    console.log('\nUser 2:');
    console.log('  Mobile: 9876543212');
    console.log('  PIN: 9012');
    console.log('----------------------------------------\n');

    console.log('📊 Summary:');
    console.log(`  Total Budget: ₹${budget.totalBudget.toLocaleString()}`);
    console.log(`  Amount Spent: ₹${budget.amountSpent.toLocaleString()}`);
    console.log(`  Remaining: ₹${budget.remaining.toLocaleString()}`);
    console.log(`  Total Tasks: ${tasks.length}`);
    console.log(`  Total Expenses: ${expenses.length} (3 approved, 2 pending)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
