/**
 * Utility script to generate a hashed admin password
 * Run: node scripts/hash-admin-password.js <password>
 * Then copy the output to your .env file as ADMIN_PASSWORD
 */

const bcrypt = require('bcryptjs')

const password = process.argv[2]

if (!password) {
  console.error('Usage: node scripts/hash-admin-password.js <password>')
  process.exit(1)
}

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('Hashed password:')
    console.log(hash)
    console.log('\nCopy this hash to your .env file as ADMIN_PASSWORD')
  })
  .catch(err => {
    console.error('Error hashing password:', err)
    process.exit(1)
  })
