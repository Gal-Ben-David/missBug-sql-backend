import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'

export const bugService = {
    remove,
    query,
    getById,
    add,
    update,
}

async function query(filterBy = {}, sortBy = {}) {
    try {
        const namePart = `%${filterBy.name || ''}%`
        // const severity = filterBy.severity || null
        let query = `SELECT * FROM bug WHERE 1=1`
        const sortColumn = sortBy.column || 'name'
        const sortOrder = sortBy.dir === 1 ? 'ASC' : 'DESC'
        const params = []

        if (filterBy.name) {
            query += ` AND (bug.name LIKE ? OR bug.description LIKE ?)`
            params.push(namePart, namePart)
        }

        if (filterBy.severity) {
            query += ` AND bug.severity >= ?`
            params.push(filterBy.severity)
        }

        query += ` ORDER BY ${sortColumn} ${sortOrder}`

        return dbService.runSQL(query, params)

    } catch (err) {
        loggerService.error('cannot find bugs', err)
        throw err
    }
}

async function getById(bugId) {
    try {
        const query = `SELECT * FROM bug  
                     WHERE id = ?`

        return dbService.runSQL(query, [bugId])
    } catch (err) {
        loggerService.error(`while finding bug ${bugId}`, err)
        throw err
    }
}

async function remove(bugId) {
    try {
        const query = `DELETE FROM bug  
                     WHERE id = ?`

        return dbService.runSQL(query, [bugId])
    } catch (err) {
        loggerService.error(`cannot remove bug ${bugId}`, err)
        throw err
    }
}

async function add(bug) {
    try {
        const query = `INSERT INTO bug (name, description, severity, createdAt) 
                       VALUES (?, ?, ?, NOW())`

        const values = [
            bug.name,
            bug.description,
            bug.severity,
            // JSON.stringify(bug.creator), 
        ]

        return dbService.runSQL(query, values)
    } catch (err) {
        loggerService.error('cannot insert bug', err)
        throw err
    }
}

async function update(bug) {
    try {
        const query = `UPDATE bug SET severity = ?
                       WHERE id = ?`
        return dbService.runSQL(query, [bug.severity, bug.id])

    } catch (err) {
        loggerService.error(`cannot update bug ${bug._id}`, err)
        throw err
    }
}
