#!/usr/bin/env node

import { program } from "commander";
import inquirer from "inquirer";
import crypto from "crypto";
import { promises as fs } from "fs";
import { errLog, successLog } from "./utils/logs.js";


async function saveVault(vaultName, masterPassword) {
    await fs.writeFile(`${vaultName}.txt`, "Vault\n");
    successLog(`Vault "${vaultName}" saved`);
    return;
}

async function createVaultMenu() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Please provide a name for the vault:'
        },
        {
            type: 'password',
            name: 'password',
            message: 'Please enter a master password:'
        },
        {
            type: 'password',
            name: 'confirmPassword',
            message: 'Please confirm the master password:'
        }
    ]);

    if (answers.password !== answers.confirmPassword) {
        errLog("Passwords do not match. Please try again.");
        return;
    }
    await saveVault(answers.name, answers.password);
}

async function signinVault() {
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Enter the vault name:'
        },
        {
            type: 'password',
            name: 'password',
            message: 'Enter the vault password:'
        },
    ]);

    try {
        const file = await fs.readFile(`${answers.name}.txt`, { encoding: 'utf8' });
        if (!file) {
            errLog("Vault doesn't exist. Try again");
            process.exit(1);
        }

        successLog('Thank you, you are now signed in.');
        var key = padKey(answers.password);
        await SignMenu(answers.name, key);
    } catch (error) {
        errLog(error.message);
    }
}

//used kdf to use the master password for each vault as a key to encrypt and decrypt credentials
function padKey(key) {
    const iterations = 100000;
    const keyLength = 32;
    return crypto.pbkdf2Sync(key, 'salt', iterations, keyLength, 'sha512');
}

function encrypt_AES(data, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return iv.toString('hex') + encryptedData;
}

function decrypt_AES(data, key) {
    const iv = Buffer.from(data.slice(0, 32), 'hex');
    const encryptedData = data.slice(32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
}

async function storeRow(file, key) {
    if (!file || !key) {
        errLog('⚠️  Not signed in to vault. Sign in to vault again\n');
        return;
    }
    try {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'record',
                message: 'Please enter the record name: '
            },
            {
                type: 'input',
                name: 'username',
                message: 'Please enter username: '
            },
            {
                type: 'password',
                name: 'password',
                message: 'Please enter password: '
            },
        ]);

        const title = answers.record;
        const username = answers.username;
        const password = answers.password;

        const rows = (await fs.readFile(`${file}.txt`, "utf8")).split('\n');
        for (const e of rows) {
            const parts = e.split(':');
            if (parts[0] == answers.record) {
                errLog('Password already exists for the record\n');
                return;
            }

        }

        const encryptedUsername = encrypt_AES(username, key);
        const encryptedPassword = encrypt_AES(password, key);
        const data = `${title}:${encryptedUsername}:${encryptedPassword}\n`;
        await fs.appendFile(`${file}.txt`, data);
        successLog('Added password');
    } catch (error) {
        errLog(error.message);
    }

}

async function getRow(file, key) {
    if (!file || !key) {
        errLog('⚠️  Not signed in to vault. Sign in to vault again\n');
        return;
    }
    try {
        const answers = await inquirer.prompt([
            {
                type: 'input',
                name: 'record',
                message: 'Please enter the record name:'
            },
        ]);

        const rows = (await fs.readFile(`${file}.txt`, "utf8")).split('\n');

        for (const e of rows) {
            const parts = e.split(':');
            if (parts[0] == answers.record) {
                //found
                const decryptedUsername = decrypt_AES(parts[1], key);
                const decryptedPassword = decrypt_AES(parts[2], key);
                successLog(`username : ${decryptedUsername}, password : ${decryptedPassword}`);
                return;
            }
        }

        errLog('⚠️  No record found');
    } catch (error) {
        errLog("⚠️  You've entered wrong master password");
        process.exit(1);
    }
}

async function SignMenu(file, key) {
    try {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'choice',
                choices: [
                    'Add a password to a vault',
                    'Fetch a password from a vault',
                    'Quit'
                ]
            }
        ]);
        const choice = answers.choice;
        switch (choice) {
            case 'Add a password to a vault':
                await storeRow(file, key);
                await SignMenu(file,key);
                break;
            case 'Fetch a password from a vault':
                await getRow(file, key);
                await SignMenu(file,key);
                break;
            case 'Quit':
                break;
            default:
                await SignMenu(file, key);
        }
    } catch (error) {
        errLog(error.message);
    }
}

async function menu() {
    try {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'Welcome to CC Password Manager. What would you like to do?',
                choices: [
                    'Create new password vault',
                    'Sign in to a vault',
                    'Add a password to a vault',
                    'Fetch a password from a vault',
                    'Quit'
                ]
            }
        ]);
        const choice = answers.choice;
        switch (choice) {
            case 'Create new password vault':
                await createVaultMenu();
                menu();
                break;
            case 'Sign in to a vault':
                await signinVault();
                menu();
                break;
            case 'Add a password to a vault':
                storeRow();
                menu();
                break;
            case 'Fetch a password from a vault':
                getRow();
                menu();
                break;
            case 'Quit':
                process.exit(0);
            default:
                menu();
        }
    } catch (error) {
        errLog(error.message);
    }
}

program
    .version("1.0.0")
    .description("Vault CLI")
    .action(async()=>{
        await menu();
    })

program.parse(process.argv);
