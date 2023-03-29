const mongoose = require('mongoose');

const ID = 'munoza'; 
const PASSWORD = 'TkTW53nNa9uYhzam'; 
const NET = 'cluster0.gznuauy.mongodb.net/test';

// Connection URI
const uri = `mongodb+srv://${ID}:${PASSWORD}@${NET}?retryWrites=true&w=majority`;

module.exports = mongoose;
