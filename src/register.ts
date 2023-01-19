import {USER_PATH} from './constants.js'
import {fn, spawnChild} from './factory'
import {User} from './types'

const register = fn<
  {
    token: string
    userId: string
    username: string
    password: string
    pageId: string
    pageToken: string
    isAdmin: boolean
  },
  void
>(
  async (args, _, {req, res}) => {
    const {verify} = await import('./internal/toolbox/token/factory.js')
    if (verify(args.token)) {
      const {generatePasswordHash} = await import(
        './internal/toolbox/hash/hash.js'
      )

      // Check if user.parquet file exists and if not, create it
      const fs = await import('fs')
      if (!fs.existsSync(USER_PATH)) {
        const defaultUser = [
          {
            userId: '0',
            username: 'admin',
            passwordHash: await generatePasswordHash(args.password),
            pageId: '0',
            pageToken: '',
            isAdmin: true
          } as User
        ]

        await spawnChild('venv/bin/python', 'internal/toolbox/pit/pit.py', [
          'dump',
          USER_PATH,
          JSON.stringify(defaultUser)
        ])
      } else {
        let users: any = JSON.parse(
          await spawnChild('venv/bin/python', 'internal/toolbox/pit/pit.py', [
            'retrieve',
            USER_PATH
          ])
        )
        users.push({
          userId: args.userId,
          username: args.username,
          passwordHash: await generatePasswordHash(args.password),
          pageId: args.pageId,
          pageToken: args.pageToken,
          isAdmin: args.isAdmin
        } as User)
        await spawnChild('venv/bin/python', 'internal/toolbox/pit/pit.py', [
          'dump',
          USER_PATH,
          JSON.stringify(users)
        ])
      }
    } else {
      throw new Error('Unable to authenticate')
    }
  },
  {
    name: 'register'
  }
)

export default register
