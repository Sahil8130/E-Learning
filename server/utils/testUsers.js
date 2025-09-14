const bcrypt = require('bcryptjs');

// In-memory user store for testing when MongoDB is not available
const testUsers = [
  {
    _id: 'test-user-1',
    name: 'Test Student',
    email: 'student@test.com',
    password: '$2a$10$jPVeJeHdZH.t47SRmS0P0uBmW/ylMaqR.OpSXnifJvNvgLYeV/D6q', // password
    role: 'student'
  },
  {
    _id: 'test-user-2',
    name: 'Test Instructor',
    email: 'instructor@test.com',
    password: '$2a$10$jPVeJeHdZH.t47SRmS0P0uBmW/ylMaqR.OpSXnifJvNvgLYeV/D6q', // password
    role: 'instructor'
  },
  {
    _id: 'test-user-3',
    name: 'John Student',
    email: 'john@example.com',
    password: '$2a$10$jPVeJeHdZH.t47SRmS0P0uBmW/ylMaqR.OpSXnifJvNvgLYeV/D6q', // password
    role: 'student'
  },
  {
    _id: 'test-user-4',
    name: 'Jane Instructor',
    email: 'jane@example.com',
    password: '$2a$10$jPVeJeHdZH.t47SRmS0P0uBmW/ylMaqR.OpSXnifJvNvgLYeV/D6q', // password
    role: 'instructor'
  },
  {
    _id: 'test-user-5',
    name: 'Demo User',
    email: 'demo@demo.com',
    password: '$2a$10$jPVeJeHdZH.t47SRmS0P0uBmW/ylMaqR.OpSXnifJvNvgLYeV/D6q', // password
    role: 'student'
  },
  {
    _id: 'test-user-6',
    name: 'Madrid User',
    email: 'madrid.2201205@iiitbh.ac.in',
    password: '$2a$10$jPVeJeHdZH.t47SRmS0P0uBmW/ylMaqR.OpSXnifJvNvgLYeV/D6q', // password
    role: 'student'
  }
];

// Function to find user by email
const findUserByEmail = (email) => {
  return testUsers.find(user => user.email === email);
};

// Function to find user by ID
const findUserById = (id) => {
  return testUsers.find(user => user._id === id);
};

// Function to compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  testUsers,
  findUserByEmail,
  findUserById,
  comparePassword
};
