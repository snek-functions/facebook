import {ADMIN_PASSWORD, USER_PATH} from './constants.js'
import {fn, spawnChild} from './factory'
import {User} from './types'

const login = fn<
  {username: string; password: string},
  {
    userId: string
    jwtId: string
    accessToken: string
  }
>(
  async ({username, password}, _, {req, res}) => {
    const {verify, generatePasswordHash} = await import(
      './internal/toolbox/hash/hash.js'
    )
    const scope = {
      res1: ['read', 'write'],
      res2: ['read', 'write']
    }

    // Check if user.parquet file exists and if not, create it
    const fs = await import('fs')
    if (!fs.existsSync(USER_PATH)) {
      const defaultUser = [
        {
          userId: '0',
          username: 'admin',
          passwordHash: await generatePasswordHash(ADMIN_PASSWORD),
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
    }

    const userStr = await spawnChild(
      'venv/bin/python',
      'internal/toolbox/pit/pit.py',
      ['search', USER_PATH, `username=${username}`]
    )
    console.log(userStr)

    const user = JSON.parse(userStr)[0] as User

    if (user.userId !== '007') {
      if (await verify(password, user.passwordHash)) {
        const {newAccessToken} = await import(
          './internal/toolbox/token/factory.js'
        )
        const Session: any = await newAccessToken({
          subject: user.userId,
          payload: {
            scope
          },
          duration: '10y'
        })
        return {
          userId: user.userId.toString(),
          jwtId: Session.jwtid,
          accessToken: Session.token
        }
      }
    }

    throw new Error(`Unable to authenticate: ${username}`)
  },
  {
    name: 'login'
  }
)

export default login
