'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {BlogPost} = require('../models');
const {TEST_DATABASE_URL} = require('../config');
const {app, runServer, closeServer} = require('../server');

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
	return newPostObject = {
		"title": faker.Lorem.sentence(),
		"author": {
			"firstName": faker.Name.firstName(), 
			"lastName": faker.Name.lastName()
		},
		"content": faker.Lorem.paragraph()
	};
}

function clearBlogPostData(){
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
};

describe('setup Integration Tests', function(){
	before(function(){
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function(){
		return seedBlogPostData();
	});

	afterEach(function(){
		return clearBlogPostData();
	});

	after(function(){
		return closeServer();
	});

	describe('GET endpoint test', function(){
		it('should return all existing blog posts', function(){
			let res;
			return chai.request(app)
			.get('/posts')
			.then(function(newRes){
				res = newRes;
				expect(res).to.have.status(200);
				expect(res.body.blogposts).to.have.length.of.at.least(1);
				return BlogPost.count();
			})
			.then(function(count){
				expect(res.body.blogposts).to.have.length.of(count);
			});
		});
		it('should return blog posts with correct fields', function(){
			return chai.request(app).get('/posts')
			.then(function(res){
          		expect(res).to.have.status(200);
          		expect(res).to.be.json;
          		expect(res.body.blogposts).to.be.a('array');
          		expect(res.body.blogposts).to.have.length.of.at.least(1);

          		res.body.blogposts.forEach(function(object){
          			expect(object).to.be.a('object');
          			expect(object).to.include.keys('id', 'author', 'content', 'title');
          		});
			});
		});
		it('should return corrects fields and values for GET by ID', function(){
			let blogPostRes;
			return chai.request(app).get('/posts')
			.then(function(res){
				blogPostRes = res.body.blogposts[0];
				return chai.request(app).get(`/posts/${blogPostRes.id}`)
			})
			.then(function(newRes){
				expect(newRes.id).to.equal(blogPostRes.id);
				expect(newRes.author).to.equal(blogPostRes.author);
				expect(newRes.title).to.equal(blogPostRes.title);
				expect(newRes.content).to.equal(blogPostRes.content);
			});
		});
	});
	describe('POST endpoint test', function(){
		it('should add a new blog post', function(){
			const newBlogPost = generateBlogPosts();
			return chai.request(app).post('/posts').send(newBlogPost)
			.then(function(res){
          		expect(res).to.have.status(201);
          		expect(res).to.be.json;
          		expect(res.body).to.be.a('object');
          		expect(res.body).to.include.keys('id', 'author', 'content', 'title');
          		expect(res.body.author).to.equal(newBlogPost.author);
          		expect(res.body.id).to.not.be.null;
          		expect(res.body.content).to.equal(newBlogPost.content);
          		expect(res.body.title).to.equal(newBlogPost.title);
          		return BlogPost.findById(res.body.id);
			})
			.then(function(res){
				expect(res.id).to.equal(newBlogPost.id);
				expect(res.author).to.equal(newBlogPost.author);
				expect(res.content).to.equal(newBlogPost.content);
				expect(res.title).to.equal(newBlogPost.title);
			});
		});
	});

	describe('PUT endpoint test', function(){
		it('should update blog post fields', function(){
			const updatedData = {title: "TKTKTKTTK", content: "newContent"};
			return BlogPost.findOne()
			.then(function(post){
				let updatedData.id = post.id;
				return chai.request(app).put(`/posts/${updatedData.id}`).send(updatedData);
			})
			.then(function(res){
				expect(res).to.have.status(204);
          		return BlogPost.findById(updateData.id);
			})
			.then(function(post){
				expect(post.id).to.equal(updatedData.id);
				expect(post.title).to.equal(updatedData.title);
				expect(post.content).to.equal(updatedData.content);
			});
		});
	});

	describe('DELETE endpoint test', function(){
		it('should delete blog post by id', function(){
			let blogPostObject;
			BlogPost.findOne().then(function(post){
				blogPostObject.id = post.id;
				return chai.request(app).delete(`/posts/${blogPostObject.id}`);
			})
			.then(function(res){
				expect(res).to.have.status(204);
				return BlogPost.findById(blogPostObject.id);
			})
			.then(function(res){
				expect(res).to.be.null;
			})
		});
	});
});

