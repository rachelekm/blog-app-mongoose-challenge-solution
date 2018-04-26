'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {BlogPost} = require('../models');
const {TEST_DATABASE_URL} = require('../config');
const { runServer, app, closeServer } = require('../server');

chai.use(chaiHttp);

function seedBlogPostData(){
	console.log('seeding blog posts data');
	const newData = [];
	for(let i =0; i <= 10; i++){
		newData.push(generateBlogPosts());
	}
	return BlogPost.insertMany(newData);
}

function generateBlogPosts(){
	return const newPostObject = {
		"title": faker.Lorem.sentence(),
		"author": {
			"firstName": faker.Name.firstName(), 
			"lastName": faker.Name.lastName()
		}
		"content": faker.Lorem.paragraph(),
	};
}

describe('setup Integration Tests', function(){
before(function(){
	return runServer(TEST_DATABASE_URL);
	});

beforeEach(function(){
	return seedBlogPostData();
})
}
});