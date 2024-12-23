import { bugService } from './bug.service.js'
import { loggerService } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export async function getBugs(req, res) {
    try {
        const filterBy = {
            name: req.query.title || '',
            severity: +req.query.severity || 0,
            label: req.query.label || ''
        }

        const sortBy = {
            column: req.query.selector || 'name',
            dir: +req.query.selector || 1
        }

        const bugs = await bugService.query(filterBy, sortBy)
        res.send(bugs)
    } catch (err) {
        loggerService.error('Cannot get bugs', err)
        res.status(400).send('Cannot get bugs')
    }
}

export async function getBugById(req, res) {
    try {
        const bugId = req.params.id
        const bug = await bugService.getById(bugId)
        res.send(bug)
    } catch (err) {
        loggerService.error('Cannot get bug', err)
        res.status(500).send('Cannot get bug')
    }
}

export async function addBug(req, res) {
    const { loggedinUser } = req

    console.log('loggedinUser', loggedinUser)
    try {
        console.log('req.body', req.body)
        const bug = {
            name: req.body.title,
            description: req.body.description,
            severity: req.body.severity,
            labels: req.body.labels,
            creatorId: loggedinUser._id
        }
        const addedBug = await bugService.add(bug)
        const bugId = addedBug.id

        for (const label of bug.labels) {
            const labelId = await bugService.getLabelIdByName(label)
            await bugService.addBugLabel(bugId, labelId)
        }

        res.send(addedBug)

    } catch (err) {
        loggerService.error('Failed to add bug', err)
        res.status(500).send({ err: 'Failed to add bug' })
    }
}

export async function updateBug(req, res) {
    // const { loggedinUser } = req

    try {
        //optional: const toy = req.body
        const bug = {
            id: req.body.id,
            severity: req.body.severity,
        }
        const updatedBug = await bugService.update(bug)

        // socketService.broadcast({
        //     type: 'bug-updated',
        //     data: updatedBug,
        //     room: bug._id,
        //     userId: loggedinUser?._id || {
        //         _id: '6737239f06c9b704f496443a',
        //         fullname: 'Abi Abambi',
        //         imgUrl: '/img/user/gal.png',
        //     },
        // })

        // console.log('Broadcast called for bug-updated')

        res.send(updatedBug)
    } catch (err) {
        loggerService.error('Failed to update bug', err)
        res.status(500).send({ err: 'Failed to update bug' })
    }
}

export async function removeBug(req, res) {
    try {
        const bugId = req.params.id
        const deletedCount = await bugService.remove(bugId)
        res.send(`${deletedCount} bugs removed`)
    } catch (err) {
        loggerService.error('Failed to remove bug', err)
        res.status(500).send({ err: 'Failed to remove bug' })
    }
}