import { bugService } from './bug.service.js'
import { loggerService } from '../../services/logger.service.js'
import { socketService } from '../../services/socket.service.js'

export async function getBugs(req, res) {
    try {
        const filterBy = {
            // email: req.query.email || '',
            // txt: req.query.txt || '',
        }
        const bugs = await bugService.query(filterBy)
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
    // const { loggedinUser } = req
    try {
        const bug = {
            name: req.body.name,
            description: req.body.description,
            severity: req.body.severity
        }

        const addedBug = await bugService.add(bug)
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