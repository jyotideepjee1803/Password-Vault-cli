# Javascript Password Vault CLI Tool

## Introduction 
- This is a fun project where I provided my solution to a Coding Challenge [Build Your Own Password Manager](https://codingchallenges.fyi/challenges/challenge-password-manager/) by [John Crickett](https://github.com/JohnCrickett) 

## Install
```
npm install -g vault
```

## Features
- Create a new password vault
- Sign in to an existing password vault
- Add a password to a vault
- Fetch a password from a vault

## Security
- The vault uses the symmetric encryption algorithm AES-256 to encrypt the credentials for each record

## Usage
Enter the following command and a menu will appear giving the different choices to create a new vault, signing in, adding or fetching password.
```
vault
```
Once entered the above command you'll be presented with the following menu, through which you can navigate via up-down arrow keys
```
? Welcome to CC Password Manager. What would you like to do?
❯ Create new password vault
  Sign in to a vault
  Add a password to a vault
  Fetch a password from a vault
  Quit
```
1. When selected create new password vault : Enter the vault name, master password and confirm the password
```
? Please provide a name for the vault: example
? Please enter a master password: [hidden]
? Please confirm the master password: [input is hidden] 
```
2. When selected Sign in to a vault : Enter the vault name and master password
```
? Enter the vault name: test
? Enter the vault password: [input is hidden] 
```
  - Once signed in you'll have the following options
    ```
    ? choice: (Use arrow keys)
    ❯ Add a password to a vault 
      Fetch a password from a vault
      Quit
    ```
  - 2 a. When selected Add a password to a vault : Enter the record name, username and password 
    ```
    ? choice: Add a password to a vault
    ? Please enter the record name:  exampleRecord
    ? Please enter username:  exampleUser
    ? Please enter password:  [input is hidden] 
    ```
  - 2 b. When selected Fetch a password from a vault : Enter the record name to get the credentials
    ```
    ? choice: Fetch a password from a vault
    ? Please enter the record name: exampleRecord
    username : exampleUser, password : 1234567
    ```
