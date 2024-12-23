import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'

import { ObjectId } from 'mongodb'

export const userService = {
	query,
	getById,
	getByUsername,
	remove,
	update,
	add,
}

async function query(filterBy = {}) {
	// const criteria = _buildCriteria(filterBy)
	try {
		const collection = await dbService.getCollection('user')
		var users = await collection.find().toArray()
		// var users = await collection.find(criteria).sort({ nickname: -1 }).toArray()
		users = users.map(user => {
			delete user.password
			user.createdAt = user._id.getTimestamp()
			return user
		})
		return users
	} catch (err) {
		loggerService.error('cannot find users', err)
		throw err
	}
}

async function getById(userId) {
	try {
		const query = 'SELECT _id, password, fullname, imgUrl, isAdmin FROM user WHERE _id = ?'
		const result = await dbService.runSQL(query, [userId])
		if (result.length > 0) {
			delete result[0].password //result[0] is the user
			return result[0]
		}
	} catch (err) {
		loggerService.error(`while finding user ${userId}`, err)
		throw err
	}
}
async function getByUsername(username) {
	try {
		const query = 'SELECT _id, password, fullname, imgUrl, isAdmin FROM user WHERE username = ?'
		const result = await dbService.runSQL(query, [username])
		console.log('Result from DB:', result)
		if (result.length > 0) {
			return result[0]
		}
	} catch (err) {
		loggerService.error(`while finding user ${username}`, err)
		throw err
	}
}

async function remove(userId) {
	try {
		const query = 'DELETE FROM user WHERE _id=?'
		return await dbService.runSQL(query, [userId])
	} catch (err) {
		loggerService.error(`cannot remove user ${userId}`, err)
		throw err
	}
}

async function update(user) {
	try {
		// peek only updatable fields!
		const userToSave = {
			_id: ObjectId.createFromHexString(user._id),
			username: user.username,
			fullname: user.fullname,
			imgUrl: user.imgUrl
		}
		const collection = await dbService.getCollection('user')
		await collection.updateOne({ _id: userToSave._id }, { $set: userToSave })
		return userToSave
	} catch (err) {
		loggerService.error(`cannot update user ${user._id}`, err)
		throw err
	}
}

async function add(user) {
	try {
		// Validate that there are no such user:
		const existUser = await getByUsername(user.username)
		if (existUser) throw new Error('Username taken')

		// peek only updatable fields!
		const { username, fullname, password, imgUrl } = user

		const query = `INSERT INTO user (username, fullname, password, imgUrl,isAdmin) 
                       VALUES (?, ?, ?, ?, ?)`

		const values = [
			username,
			fullname,
			password,
			imgUrl || '/img/user-default.png',
			0 //indicate false for isAdmin
		]

		return dbService.runSQL(query, values)
	} catch (err) {
		loggerService.error('cannot insert user', err)
		throw err
	}
}
