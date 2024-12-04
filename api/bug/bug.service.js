import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'

export const bugService = {
    remove,
    query,
    getById,
    add,
    update,
    getLabelIdByName,
    addBugLabel
}

async function query(filterBy = {}, sortBy = {}) {
    try {
        const namePart = `%${filterBy.name || ''}%`
        // const severity = filterBy.severity || null
        let query = `SELECT DISTINCT bug.id,
                        bug.name,
                        bug.description,
                        bug.severity,
                        bug.createdAt,
                        bug.creator_id AS creatorId 
                    FROM bug`

        const sortColumn = sortBy.column || 'name'
        const sortOrder = sortBy.dir === 1 ? 'ASC' : 'DESC'
        const label = filterBy.label || ''
        const labelId = label ? await getLabelIdByName(label) : ''
        const params = []

        if (labelId) {
            query += ` LEFT JOIN bug_label bl ON bug.id = bl.bug_id
                       LEFT JOIN label l ON bl.label_id = l.id`
        }

        if (filterBy.name) {
            query += ` WHERE (bug.name LIKE ? OR bug.description LIKE ?)`
            params.push(namePart, namePart)
        } else {
            query += ` WHERE 1=1`
        }

        if (filterBy.severity) {
            query += ` AND bug.severity >= ?`
            params.push(filterBy.severity)
        }

        if (labelId) {
            query += ` AND l.id IN (?)`
            params.push(labelId)
        }

        query += ` ORDER BY bug.${sortColumn} ${sortOrder}`

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
                     WHERE id=?`

        return dbService.runSQL(query, [bugId])
    } catch (err) {
        loggerService.error(`cannot remove bug ${bugId}`, err)
        throw err
    }
}

async function add(bug) {
    try {
        const query = `INSERT INTO bug (name, description, severity, creator_id, createdAt) 
                       VALUES (?, ?, ?, ?, NOW())`

        if (!bug.name) {
            throw new Error('Bug name is required')
        }
        if (!bug.severity) {
            throw new Error('Bug severity is required')
        }

        const values = [
            bug.name,
            bug.description,
            bug.severity,
            bug.creatorId
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
        const query = `UPDATE bug SET severity=?
                       WHERE id=?`
        return dbService.runSQL(query, [bug.severity, bug.id])

    } catch (err) {
        loggerService.error(`cannot update bug ${bug._id}`, err)
        throw err
    }
}

async function getLabelIdByName(labelName) {
    try {
        const query = 'SELECT id FROM label WHERE name = ?'
        const result = await dbService.runSQL(query, [labelName])
        if (result.length > 0) {
            return result[0].id
        }
    } catch (err) {
        console.error(`Label ${labelName} not found`, err)
    }
}

// Add entry to `bug_label` table
async function addBugLabel(bugId, labelId) {
    const query = 'INSERT INTO bug_label (bug_id, label_id) VALUES (?, ?)'
    await dbService.runSQL(query, [bugId, labelId])
}