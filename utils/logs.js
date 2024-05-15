import chalk from 'chalk';

const colorize = {
  red: chalk.red,
  green: chalk.green,
};

const errLog = (message) => {
  console.error(colorize.red(message));
};

const successLog = (message) => {
  console.log(colorize.green(message));
};

export { errLog, successLog };