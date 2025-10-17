const { exec } = require('child_process');

console.log('Starting database wipe using "prisma migrate reset"...');

// Using --force to skip the interactive confirmation prompt, suitable for scripts.
const command = 'npx prisma migrate reset --force';

const process = exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error during database wipe: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
  }
  console.log(`Stdout: ${stdout}`);
  console.log('Database wipe and reset finished successfully.');
});

process.stdout.on('data', (data) => {
  console.log(data.toString());
});

process.stderr.on('data', (data) => {
  console.error(data.toString());
});