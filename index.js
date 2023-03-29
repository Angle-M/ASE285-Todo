// npm install express
// npm install ejs
// npm install -g nodemon
// npm install method-override
// nodemon ./index.js
// Access this server with http://localhost:5500/pet or http://localhost:5500/

//import mongoose from 'mongoose';
const mongoose = require('mongoose');
//import express from 'express';
const express = require('express');
//make app set to express
const app = express();
//import bodyParser from 'body-parser';
const bodyParser = require('body-parser');
//import dotenv from 'dotenv';
const dotenv = require('dotenv');
//gets the .env file
dotenv.config();
//imports the model
const { postModel, counterModel } = require('./model/models.ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
//sets the view engine to ejs
app.set('view engine', 'ejs');
//sets the public folder to static
app.use('/public', express.static('public'));

// Connect to MongoDB
main().catch(err => console.log(err));

// Connect to MongoDB
async function main() {
    // Connect to the MongoDB cluster with the ENV variable
    await mongoose.connect(process.env.MONGODB_URI, {
        //uses parses the url
        useNewUrlParser: true,
        //uses unified topology
        useUnifiedTopology: true,
    });
    //display connected to MongoDB
    console.log('Connected to MongoDB');

    // Start the server and listen on port 5500
    app.listen(5500, function () {
        //display listening on 5500
        console.log('listening on 5500');
    });
}

//get the home page
app.get('/', function (req, resp) {
    try {
        //render the home page as write.ejs
        resp.render('write.ejs');
        //catch any errors
    } catch (e) {
        //display the error
        console.error(e);
    }
});

//add a new post
app.post('/add', async function (req, resp) {
    try { 
        //calls and runs the runAddPost function
        await runAddPost(req, resp);
        //redirects to the home page
        resp.redirect('/');
    } catch (error) {
        //display the error
        console.error('unable to add due to', error);
        //send the error as a response
        resp.status(500).send({ error: 'Error adding post' });
    }
});

//runAddPost function
async function runAddPost(req, resp) {
    try {
        //creates counter and sets it to the totalPost after finding it in the database
        const counter = await counterModel.findOne({ name: 'Total Post' }).exec();
        //creates totalPost and sets it to the totalPost in the database
        const totalPost = counter.totalPost;
        //creates post and sets it to the postID, title, and date
        const post = new postModel({ postID: totalPost + 1, title: req.body.title, date: req.body.date });
        //saves the post
        await post.save();
        //adds 1 to the totalPost
        counter.totalPost++;
        //saves the counter
        await counter.save();
        //display add complete
        console.log('Add complete');
    } catch (error) {
        //display the error
        console.error(error);
        //send the error as a response
        resp.status(500).send({ error: 'Error adding post' });
    }
};

//get the list page
app.get('/list', async function (req, res, next) {
    try {
        //creates posts and sets it to the posts in the database after finding them
        const posts = await postModel.find().exec();
        //creates query and sets it to the posts
        const query = { posts: posts };
        //renders the list page as list.ejs
        res.render('list.ejs', query);
    } catch (error) {
        //display the error
        console.error(error);
        //send the error as a response
        res.status(500).send({ error: 'Error getting posts' });
    }
});

//get the list page as json
app.get('/listjson', async function (req, res) {
    try {
        //creates posts and sets it to the posts in the database after finding them
        const posts = await postModel.find().exec();
        //sends the posts as a response in json
        res.json(posts);
    } catch (error) {
        //display the error
        console.error(error);
        //send the error as a response
        res.status(500).send({ error: 'Error getting posts' });
    }
});

//delete a post
app.delete('/delete', async function (req, resp) {
    try {
        //creates postId and sets it to the postID in the query
        const postId = parseInt(req.query.postID);
        //sends the postId to the console
        console.log(req.query.postID);
        //sends the postId to the console as an integer
        console.log(parseInt(req.query.postID));
        //creates deletedPost and finds it in the database and deletes it
        const deletedPost = await postModel.findOneAndDelete({ postID: postId });

        if (!deletedPost) {
            //sends the error as a response
            return resp.status(404).send({ error: 'Post not found' });
        }

        /*
        const updatedCount = await totalPostModel.findOneAndUpdate(
            { name: 'Total Post' },
            { $inc: { count: -1 } },
            { new: true }
        );
        */
        //sends a delete message to the console
        console.log(`Deleted post with ID: ${postId}`);
        //sends a delete message as a response
        resp.send({ message: 'Post deleted' });
            } catch (error) {
                //display the error
                console.error('Delete error:', error.message);
                //send the error as a response
                resp.status(500).send({ error: 'Error deleting post' });
            }
});

//get the detail page by ID
app.get('/detail/:id', async function (req, resp) {
    try {
        //creates postId and sets it to the postID in the query
        const postId = parseInt(req.params.id);
        //creates post and sets it to the post in the database after finding it
        const post = await postModel.findOne({ postID: postId }).exec();
        //checks if the post exists
        if (post) {
            //renders the detail page as detail.ejs
            resp.render('detail.ejs', { data: post });
            //sends the postId to the console
            console.log(`app.get.detail: Found post with id ${postId}`);
        } else {
            //sends the error as a response
            resp.status(404).send({ error: `Post with id ${postId} not found.` });
        }
    } catch (error) {
        //display the error
        console.log(error);
        //send the error as a response
        resp.status(500).send({ error: 'Error from Post.findOne()' });
    }
});

//get the update page by ID
app.get('/update/:id', async function (req, resp) {
    try {
        //creates postId and sets it to the postID in the params
        const postId = (req.params.id);
        //creates post and sets it to the post in the database after finding it
        const post = await postModel.findOne({ postID: postId }).exec();
        //checks if the post exists
        if (post) {
            //renders the update page as update.ejs with the post data
            resp.render('update.ejs', { data: post });
            //sends the postId to the console
            console.log(`app.get.detail: Found post with id ${postId}`);
        } else {
            //sends the error as a response
            resp.status(404).send({ error: `Post with id ${postId} not found.` });
        }
    } catch (error) {
        //display the error
        console.log(error);
        //send the error as a response
        resp.status(500).send({ error: 'Error from Post.findOne()' });
    }
});

//still working on this
//update a post informaton and send it to the database
app.put('/update/:id', async function (req, resp) {
    try {
        //creates postId and sets it to the postID in the params
        const postId = parseInt(req.params.postID);
        //sends the postId to the console
        console.log('params',req.params.id);
        //creates updatedPost and sets it to the body of the request
        const updatedPost = req.body;
        //sends the updatedPost to the console
        console.log('updatePost',updatedPost)
        //creates result and sets it to the post in the database after finding it and updating it
        const result = await postModel.findByIdAndUpdate(postId, updatedPost);
        //redirects to the list page after updating
        res.redirect('/list');
    } catch (error) {
        //display the error
        console.log(error);
        //send the error as a response
        resp.status(500).send({ error: 'Error updating post' });
    }
});